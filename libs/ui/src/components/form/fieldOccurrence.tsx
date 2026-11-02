import React from 'react';


type Listener = () => void;

/**
 * Which copy of a schema field each mounted control is, across one form. A form may show the same field
 * more than once (a shared unit of measure next to two amounts); every copy binds to the one form value,
 * so a change shows everywhere, but only the first mounted copy shows the field's error, and the others
 * need their own test id. Copies register in mount order, which is document order for a static layout.
 */
export class FieldOccurrenceRegistry {
	private readonly byName = new Map<string, string[]>();
	private readonly listeners = new Set<Listener>();

	register(name: string, key: string): () => void {
		this.byName.set(name, [...(this.byName.get(name) ?? []), key]);
		this.notify();
		return () => {
			const left = (this.byName.get(name) ?? []).filter(other => other !== key);
			if (left.length > 0) {
				this.byName.set(name, left);
			}
			else {
				this.byName.delete(name);
			}
			this.notify();
		};
	}

	/** The copy's 0-based position among the mounted copies of `name`; 0 until it has registered. */
	indexOf(name: string, key: string): number {
		return Math.max(this.byName.get(name)?.indexOf(key) ?? 0, 0);
	}

	/** How many copies of `name` are mounted. */
	countOf(name: string): number {
		return this.byName.get(name)?.length ?? 0;
	}

	subscribe = (listener: Listener): (() => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	private notify(): void {
		this.listeners.forEach(listener => listener());
	}
}

const FieldOccurrenceRegistryContext = React.createContext<FieldOccurrenceRegistry | null>(null);

/** One registry per form: `CrudFormProvider` and `AdhocFormProvider` open it for their fields. */
export function FieldOccurrenceScope({ children }: { children: React.ReactNode }): React.ReactNode {
	const [registry] = React.useState(() => new FieldOccurrenceRegistry());
	return (
		<FieldOccurrenceRegistryContext.Provider value={registry}>{children}</FieldOccurrenceRegistryContext.Provider>
	);
}

function noSubscription(): () => void {
	return () => undefined;
}

/**
 * Registers this copy of `name` with the enclosing form and answers its 0-based position among the
 * copies. Outside a form, or for the only copy, it is 0.
 */
export function useFieldOccurrence(name: string): number {
	const registry = React.useContext(FieldOccurrenceRegistryContext);
	const key = React.useId();
	React.useLayoutEffect(() => registry?.register(name, key), [registry, name, key]);
	return React.useSyncExternalStore(
		registry?.subscribe ?? noSubscription,
		() => registry?.indexOf(name, key) ?? 0,
	);
}

/**
 * Whether the form shows more than one copy of `name`. An input bound through `register` reads its value
 * from the one element react-hook-form holds a ref to, so such an input binds through a `Controller`
 * instead while it has copies.
 */
export function useFieldHasCopies(name: string): boolean {
	const registry = React.useContext(FieldOccurrenceRegistryContext);
	return React.useSyncExternalStore(
		registry?.subscribe ?? noSubscription,
		() => (registry?.countOf(name) ?? 0) > 1,
	);
}

type FieldOccurrence = { name: string, index: number };

const FieldOccurrenceContext = React.createContext<FieldOccurrence | null>(null);

/** Tells the controls of one `AutoField` which copy of their field they render. */
export function FieldOccurrenceProvider({ name, index, children }: FieldOccurrence & {
	children: React.ReactNode,
}): React.ReactNode {
	const value = React.useMemo(() => ({ name, index }), [name, index]);
	return <FieldOccurrenceContext.Provider value={value}>{children}</FieldOccurrenceContext.Provider>;
}

/** The copy of `name` the enclosing `AutoField` renders: 0 for the first copy, or for any other field. */
export function useFieldOccurrenceIndex(name: string | undefined): number {
	const occurrence = React.useContext(FieldOccurrenceContext);
	return occurrence && occurrence.name === name ? occurrence.index : 0;
}

/**
 * The `data-testid` segment that tells copies of one field apart: none for the first copy, so a field
 * shown once keeps its plain id, then `copy2`, `copy3`, … in document order.
 */
export function fieldOccurrenceTestSegment(index: number): string | undefined {
	return index > 0 ? `copy${index + 1}` : undefined;
}
