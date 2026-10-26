import { randomBytes } from 'node:crypto';
import { PassThrough, type Readable } from 'node:stream';


/** The text parts Storage's upload reads before the file part. */
export interface UploadFields {
	readonly orgId?: string;
	readonly name: string;
	readonly mimeType: string;
	readonly sizeBytes: number;
}

export interface UploadBody {
	readonly body: Readable;
	readonly contentType: string;
	/** Detaches the file from the body and discards the rest of it, so the browser form keeps being read. */
	readonly abandon: () => void;
}

/**
 * Storage's upload form around one browser file part: `org_id`, `name`, `mime_type`, `size_bytes`, then `file`
 * last. The file is piped through as it arrives, never buffered.
 */
export function buildUploadBody(file: Readable, fields: UploadFields): UploadBody {
	const boundary = `nikkiBff${randomBytes(12).toString('hex')}`;
	const body = new PassThrough();
	body.write(buildHead(boundary, fields));
	file.pipe(body, { end: false });
	file.once('end', () => !body.destroyed && body.end(`\r\n--${boundary}--\r\n`));
	file.once('error', (err) => body.destroy(err));
	return {
		body,
		contentType: `multipart/form-data; boundary=${boundary}`,
		abandon: () => {
			file.unpipe(body);
			body.destroy();
			file.resume();
		},
	};
}

function buildHead(boundary: string, fields: UploadFields): string {
	const parts: Array<[string, string]> = fields.orgId ? [['org_id', fields.orgId]] : [];
	parts.push(['name', fields.name], ['mime_type', fields.mimeType], ['size_bytes', String(fields.sizeBytes)]);
	const text = parts
		.map(([name, value]) => `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`)
		.join('');
	return `${text}--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${quote(fields.name)}"\r\n`
		+ `Content-Type: ${stripLineBreaks(fields.mimeType)}\r\n\r\n`;
}

// The WHATWG form encoding of a filename in a part header.
function quote(value: string): string {
	return value.replace(/\r/g, '%0D').replace(/\n/g, '%0A').replace(/"/g, '%22');
}

function stripLineBreaks(value: string): string {
	return value.replace(/[\r\n]/g, '');
}
