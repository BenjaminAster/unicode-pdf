
import { css, type Config as WinzigConfig } from "winzig";
import { controlCharacterMappings, includedBlocks, nonPrintableCharacters, shrinkedCharacters } from "./constants.ts";
import pathToUCD from "./path-to-ucd.ts";

winzigConfig: ({
	output: "../",
	appfiles: "appfiles",
	css: "./main.css",
	noCSSScopeRules: true,
	noJavaScript: true,
}) satisfies WinzigConfig;

const title = "unicode";

const { blocks } = await (await fetch(import.meta.resolve(pathToUCD))).json();

const Table = () => {
	const table = <table>
		<colgroup>
			<col class="first-col" />
			{...Array.from({ length: 16 }, () => <col />)}
		</colgroup>
		<thead>
			<tr>
				<th></th>
				{...Array.from({ length: 16 }, (_, i) => <th>{i.toString(16).toUpperCase()}</th>)}
			</tr>
		</thead>
		{...blocks.filter((block: any) => includedBlocks.has(block.id)).map((block: any) => {
			const tBody = <tbody></tbody>;

			tBody.append(<th colSpan={17}>{block.name}</th>);

			const characters = block.subdivisions.flatMap(
				(subdivision: any) => subdivision.characters.map((character: any) => character[0])
			) as number[];
			let currentCharacterIndex = 0;

			for (let globalRowIndex = Math.floor(block.start / 16); globalRowIndex <= Math.floor(block.end / 16); ++globalRowIndex) {
				const tRow = <tr><th>{globalRowIndex.toString(16).toUpperCase().padStart(3, "0")}</th></tr>;
				let rowHasCharacters = false;
				for (let column = 0; column < 16; ++column) {
					const codePoint = globalRowIndex * 16 + column;
					if (codePoint === (characters[currentCharacterIndex] ?? -1)) {
						tRow.append(<td
							class:control-character={controlCharacterMappings.has(codePoint)}
							class:shrink={shrinkedCharacters.has(codePoint)}
						>{
							controlCharacterMappings.get(codePoint)
							?? (String.fromCodePoint(codePoint) + (codePoint > 0x2122 ? "\uFE0F" : ""))
						}</td>);
						++currentCharacterIndex;
						rowHasCharacters = true;
					} else {
						tRow.append(<td class="unused-code-point">X</td>)
					}
				}
				if (rowHasCharacters) tBody.append(tRow);
			}

			return tBody;
		})}
		<tfoot>
			<tr>
				<th></th>
				{...Array.from({ length: 16 }, (_, i) => <th>{i.toString(16).toUpperCase()}</th>)}
			</tr>
		</tfoot>
		{css`
			& {
				inline-size: 100%;
				border-collapse: collapse;
				border-collapse: separate;
				border-spacing: 0;
				table-layout: fixed;
				text-align: center;
				/* break-inside: avoid; */
				/* outline: 1px solid light-dark(black, white); */
				/* outline-offset: -1px; */
				/* outline: 1px solid light-dark(black, white); */
				/* outline-offset: 1px; */
				/* -webkit-box-decoration-break: clone; */
				/* box-decoration-break: clone; */
			}

			thead th {
				border-block-end-style: solid;
			}

			tfoot th {
				border-block-start-style: solid;
			}

			td, th {
				/* border: 1px solid light-dark(#bbb, #444); */
				border: 1px none var(--text);
				padding: 0;
				/* background-clip: padding-box; */
				/* border-block-start: 0 none; */
				/* border-inline-start: 0 none; */
				/* z-index: -1; */
			}

			col.first-col {
				inline-size: 4.5ch;
			}

			td {
				/* inline-size: 0; */
				box-sizing: border-box;
			}
			
			td.shrink {
				font-size: .6em;
				padding-block-start: 3px;
			}

			th[colspan] {
				background-color: light-dark(#000, #fff);
				color: light-dark(#fff, #000);
				break-after: avoid;
			}

			th:not([colspan]), col {
				/* border-color: light-dark(black, white); */
				font-family: monospace;
			}

			tbody > tr > :first-child {
				border-inline-start-style: solid;
			}
			tbody > tr > :last-child {
				border-inline-end-style: solid;
			}

			tbody th:not([colspan]) {
				background-color: light-dark(#e8e8e8, #222);
			}

			/* thead th {
				border-block-start-width: 1px;
			} */

			/* th:first-child {
				border-inline-start-width: 1px;
			} */

			tbody tr > :nth-child(4n + 1):not(:last-child) {
				/* border-inline-start-width: 1px; */
				border-inline-end-style: solid;
			}

			/* thead > tr > *,
			tbody > tr:nth-child(4n) > * {
				border-block-end-width: 1px;
			} */

			tbody > tr:nth-child(odd) > td:nth-child(even),
			tbody > tr:nth-child(even) > td:nth-child(odd) {
				background-color: light-dark(#eeeeee, #222222);
				background-color: light-dark(#00000010, #ffffff10);
			}

			/* tbody > tr > *:first-child {
				border-inline-start: 10px solid transparent;
			}
			tbody > tr > *:last-child {
				border-inline-end: 10px solid transparent;
			} */

			.unused-code-point {
				color: red;
			}
			
			.control-character {
				color: light-dark(#444, #bbb);
			}
		`}
	</table>;

	return <div>
		<div>
			{table}
			{css`
				& {
					/* border: 1px solid light-dark(black, white); */
					/* -webkit-box-decoration-break: clone; */
					/* box-decoration-break: clone; */
				}
			`}
		</div>
		{css`
			& {
				column-count: 3;
				column-gap: 4px;
				font-size: .7rem;
				/* padding: 2px; */
			}
		`}
	</div>;
};

;
<html lang="en">
	<head>
		<title>{title}</title>
	</head>
	<body>
		<main>
			<Table />

			{/* <h2>Non-printable characters:</h2> */}

			<ul>
				{...nonPrintableCharacters.map(([codePoint, name]) =>
					<li><code>{codePoint}</code>: <span>{name}</span></li>
				)}

				{css`
					& {
						line-height: 1.2;
						padding: 0;
						margin: 0;
						margin-block-start: 5px;
						list-style: none;
						column-count: 3;
						column-count: 4;
						column-gap: 4px;
						font-size: .56rem;
						font-size: .5.2rem;
					}

					li {
						text-wrap: nowrap;
					}
					
					span {
						display: inline flow-root;
						text-wrap: wrap;
						max-inline-size: calc(100% - 6ch);
						vertical-align: text-top;
						/* translate: 0 -1px; */
					}
				`}
			</ul>

			{css`
				& {
					/* padding-inline: 1rem; */
					flex-grow: 1;
				}

				h2 {
					font-size: .9rem;
					font-weight: normal;
					margin-block: .6rem .2rem;
				}
			`}
		</main>
	</body>
</html>;
