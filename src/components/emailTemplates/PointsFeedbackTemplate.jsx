export const PointsFeedbackTemplate = ({
	name,
	editingPoints,
	designPoints,
	recordingPoints,
	price,
}) => (
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
			Здравейте, {name},
		</h2>

		<h4>
			Благодарим ви, че избрахте нашите услуги! Вашата поръчка на точков
			пакет беше успешно регистрирана.
		</h4>

		<h4>
			Детайли на поръчката:
			<div>Брой точки (Видео заснемане): {recordingPoints}</div>
			<div>Брой точки (Видео монтаж): {editingPoints}</div>
			<div>Брой точки (Дизайн): {designPoints}</div>
			<div>Сума за плащане: {price} BGN</div>
			<div>Метод на плащане: Банков превод</div>
		</h4>

		<h4>
			Данни за плащане:
			<div>IBAN: BG05STSA93000030191541</div>
			<div>Титуляр: Топ Рийч ООД </div>
			<div>
				Основание за плащане: Точков пакет - [номерът на поръчката]
			</div>
		</h4>

		<h4>
			След като преведете сумата, моля, изпратете ни потвърждение на
			плащането на topreachstudio@gmail.com, за да ускорим обработката.
		</h4>

		<h4>
			След получаване на плащането, вашият акаунт ще бъде зареден със
			съответния брой точки.
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
				topreachbg@gmail.com.
			</p>
		</footer>
	</div>
);
