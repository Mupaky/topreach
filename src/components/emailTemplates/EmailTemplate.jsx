export const EmailTemplate = ({ message, name, email }) => (
	<div
		style={{
			fontFamily: "Arial, sans-serif",
			lineHeight: "1.5",
			color: "#FFFFFF",
			backgroundColor: "#171717",
			padding: "20px",
			borderRadius: "10px",
			border: "2px solid #52BDF6",
		}}
	>
		<h4>
			Изпратено от {name} ({email})
		</h4>
		<h3>{message}</h3>
	</div>
);
