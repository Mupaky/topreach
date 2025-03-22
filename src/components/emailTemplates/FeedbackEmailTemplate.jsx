export const FeedbackEmailTemplate = ({ name }) => (
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
		<h2
			style={{
				color: "#52BDF6",
			}}
		>
			Здравей, {name},
		</h2>

		<h4>Благодарим ви, че се свързахте с нас!</h4>

		<h4>
			Получихме вашето съобщение и искаме да ви уведомим, че ще се свържем
			с вас възможно най-скоро.
		</h4>

		<h4>
			Вълнуваме се да работим с вас и скоро ще се свържем, за да обсъдим
			вашите нужди в детайли.
		</h4>

		<h4>Поздрави,</h4>
		<h4
			style={{
				color: "#52BDF6",
			}}
		>
			Екипът на Top Reach
			<br />
			topreachstudio@gmail.com
		</h4>

		<footer
			style={{
				color: "#b5b5b5",
			}}
		>
			<p>
				Ако имате въпроси, не се колебайте да се свържете с нас на
				topreachstudio@gmail.com.
			</p>
		</footer>
	</div>
);
