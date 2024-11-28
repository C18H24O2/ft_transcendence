import '../shared.js'


function uploadToBase64(file)
{
	let reader = new FileReader();

	reader.addEventListener('load', () => {
		console.log(reader.result);
		//TODO: Upload File to server
	});

	reader.readAsDataURL(file);
}

export function getFile()
{
	file = document.getElementById('file-submit-field');

	if (!file || typeof(file) === undefined)
		return;
	uploadToBase64(file);
}