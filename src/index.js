// export default {
//   async fetch(request) {
//     const data = {
//       hello: "world",
//     };

//     return Response.json(data);
//   },
// };

// export default {
// 	async fetch(request, env, ctx) {
// 		const url = new URL(request.url);

// 		if (url.pathname === '/styles/style.css') {
// 			const css = `
//         body { box-sizing: border-box; margin: 0; padding: 0; font-family: Roboto, sans-serif; }
//         main { max-width: 500px; margin-inline: auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; margin-top: 50px; background-color: #ffe7e7; }
//         h1 { color: red; text-align: center; }
//         .text { color: #000; font-size: 20px; text-align: center; margin: 0; }
//         .text-joke { color: blue; font-size: 18px; text-align: left; }
//         .joke-container { display: flex; flex-direction: column; align-items: start; gap: 5px; }
//       `;
// 			return new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
// 		}

// 		if (url.pathname === '/script/loaddata.js') {
// 			const js = `
//         async function loadData() {
//           try {
//             const response = await fetch('/api/joke');
//             const data = await response.json();

//             document.querySelector('.joke-container').innerHTML = \`
//               <p class="text">Message: \${data.message}</p>
//               <p class="text-joke">Joke: \${data.joke}</p>
//               <p class="text">Timestamp: \${data.timestamp}</p>
//             \`;
//           } catch (error) {
//             console.error("Помилка завантаження:", error);
//           }
//         }

//         loadData();
//       `;
// 			return new Response(js, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
// 		}

// 		if (url.pathname === '/api/joke') {
// 			const apiUrl = 'https://v2.jokeapi.dev/joke/Programming?type=single';
// 			const externalResponse = await fetch(apiUrl);
// 			const jokeData = await externalResponse.json();

// 			const myResponse = {
// 				status: 'success',
// 				message: 'API works!',
// 				joke: jokeData.joke,
// 				timestamp: new Date().toISOString(),
// 			};

// 			return new Response(JSON.stringify(myResponse), {
// 				headers: { 'Content-Type': 'application/json' },
// 			});
// 		}

// 		const html = `
//       <!DOCTYPE html>
//       <html lang="uk">
//       <head>
//         <meta charset="UTF-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title>My API Test</title>
//         <link rel="stylesheet" href="/styles/style.css" />
//       </head>
//       <body>
//         <main>
//           <h1>My API Test</h1>
//           <p class="text">Status: <span style="color: green;">success</span></p>
//           <div class="joke-container">
//             <p>Завантаження жарту...</p>
//           </div>
//         </main>
//         <script type="module" src="/script/loaddata.js"></script>
//       </body>
//       </html>
//     `;

// 		return new Response(html, {
// 			headers: { 'Content-Type': 'text/html; charset=utf-8' },
// 		});
// 	},
// };

// export default {
// 	async fetch(request, env) {
// 		const url = new URL(request.url);

// 		const name = url.searchParams.get('name') || 'Guest';
// 		const country = request.headers.get('cf-connecting-country') || 'UA';

// 		if (env.ANALYTICS) {
// 			env.ANALYTICS.writeDataPoint({
// 				blobs: [url.pathname, country],
// 				doubles: [1],
// 				indexes: [url.hostname],
// 			});
// 		}

// 		return new Response(`Hello, ${name}! Your backend sees that you visited from the country: ${country}.`, {
// 			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
// 		});
// 	},
// };

import { JSONParser } from '@streamparser/json-whatwg';

export default {
	async fetch(request) {
		const response = await fetch('https://jsonplaceholder.typicode.com/posts');

		const parser = new JSONParser({ paths: ['$.*'] });

		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();
		const encoder = new TextEncoder();

		(async () => {
			const reader = response.body.pipeThrough(parser).getReader();

			await writer.write(encoder.encode('{"processedItems":['));
			let first = true;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const item = value.value;

				const transformed = {
					id: item.id,
					title: item.title.toUpperCase(),
					processed: true,
				};

				if (!first) await writer.write(encoder.encode(','));
				first = false;

				await writer.write(encoder.encode(JSON.stringify(transformed)));
			}

			await writer.write(encoder.encode(']}'));
			await writer.close();
		})();

		return new Response(readable, {
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
		});
	},
};
