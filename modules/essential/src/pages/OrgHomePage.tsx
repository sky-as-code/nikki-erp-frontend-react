import { useNavigate } from 'react-router';


export const OrgHomePage: React.FC = () => {
	const navigate = useNavigate();
	return (
		<div>
			<h3>Organization Home Page</h3>
			<button onClick={() => navigate(-1)}>
				Go Back
			</button>
		</div>
	);
};