const rarities = [
	'Common',
	'Uncommon',
	'Legendary',
	'Boss',
	'Void',
	'Equipment',
	'Lunar'
];

function runningOnTouchScreen() {
	return window.matchMedia("(pointer: coarse)").matches;
}


function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function customEncodeURIComponent(str) {
	return encodeURIComponent(str).replace(/[!'()]/g, function(c) {
		return '%' + c.charCodeAt(0).toString(16);
	});
}
function getItemURL(item, magicByte) {
	return `https://static.wikia.nocookie.net/riskofrain2_gamepedia_en/images/${magicByte.charAt(0)}/${magicByte}/${customEncodeURIComponent(item.name.replaceAll(' ','_'))}.png`;
}

document.body.style.backgroundImage = `url("/images/${Math.floor(Math.random() * 12)}.png")`;

if (runningOnTouchScreen()) {
	let mobileCSS = document.createElement('link');
	mobileCSS.rel = 'stylesheet';
	mobileCSS.href = 'mobile_style.css';
	document.head.appendChild(mobileCSS);
}