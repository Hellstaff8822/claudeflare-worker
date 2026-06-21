async function loadData() {
	const response = await fetch('/');
	const data = await response.json();

	document.querySelector('main').innerHTML = `
    <p>Status: ${data.status}</p>
      <p>Message: ${data.message}</p>
      <p>Joke: ${data.joke}</p>
      <p>Timestamp: ${data.timestamp}</p>
    `;
}

loadData();

export default loadData;
