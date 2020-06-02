let data;
let reg = new RegExp(/abps\-sub-([0-9]*)/);
let url = location.href;
// !NOTE main
function main(event) {
	reset();
	isLoaded() && render();
	showDesc(isTimeLine(event));
}

document.addEventListener("mouseover", main, {
	capture: true,
	passive: true,
});

// !NOTE condition
var isLoad = false;
const timeT = "bilibili-player-video-time-total";
function isLoaded() {
	return (
		isLoad || document.getElementsByClassName(timeT)[0].innerText !== "00:00"
	);
}

var isRender = false;
function isRendered() {
	return isRender || !!document.getElementsByClassName("abps").length;
}

function isTimeLine(e) {
	const index = e.target.className.replace(reg, "$1");
	const coordinates = getCoordinates() || {};
	return coordinates[Object.keys(coordinates)[index]] || "";
}

// !NOTE getData
function getCoordinates() {
	data = {
		"01:30": "这是一段描述",
		"02:00": "这段不可描述",
		"12:51": "描述不可描述",
		"33:66": "这辈子不描述",
	};
	// TODO API 获取坐标
	return data;
}

// !NOTE function
function reset() {
	if (url !== location.href) {
		isLoad = false;
		isRender = false;
		url = location.href;
	}
}

function render() {
	isLoad = true;
	!isRendered() ? _render() : "";
}

function _render() {
	_appendStyle();
	_createParentNode();
	_createDescNode();
	isRender = true;
}

const timeLineHeight = 10;
const timeLineColor = "red";
function _appendStyle() {
	new_element = document.createElement("style");
	new_element.innerHTML = `.abps {height: ${
		timeLineHeight + "px"
	};position: absolute;display: flex;width: 100%;left:0} [class^="abps-sub-"] {border-right:1px solid ${timeLineColor};position:relative}`;
	document.body.appendChild(new_element);
}

const descTimeT = "bilibili-player-video-progress-detail-time";
const descTimeParentT = "bilibili-player-video-progress-detail-img";
function _createDescNode() {
	let newnode = document.createElement("DIV");
	newnode.classList.add(`abps-desc`);
	newnode.classList.add(descTimeT);
	document.getElementsByClassName(descTimeParentT)[0].appendChild(newnode);
}

const progressT = "bilibili-player-video-progress";
function _createParentNode() {
	document
		.getElementsByClassName(progressT)[0]
		.children[0].appendChild(appendChildNode());
}

function createParentNode() {
	let newnode = document.createElement("DIV");
	newnode.classList.add("abps");

	return newnode;
}

function appendChildNode() {
	let lastTime = 0;
	let childNode = document.createElement("DIV");
	let parentNode = createParentNode();
	let coordinates = Object.keys(getCoordinates());
	let totalTime = parseTime(
		document.getElementsByClassName(timeT)[0].innerText
	);
	let count = 0;
	if (coordinates.length) {
		for (let i of coordinates) {
			let childNodeCopy = childNode.cloneNode(false);
			let currentTime = parseTime(i);
			if (currentTime > totalTime) {
				break;
			}
			let z = (currentTime - lastTime) / totalTime;
			childNodeCopy.style.width = z * 100 + "%";
			childNodeCopy.classList.add(`abps-sub-${count}`);
			parentNode.appendChild(childNodeCopy);
			lastTime = currentTime;
			count++;
		}
	}
	return parentNode;
}

function showDesc(desc) {
	document.getElementsByClassName("abps-desc")[0].innerText = desc;
}

// !NOTE parse
function parseTime(time) {
	let newTime = time.split(":");
	return +newTime[0] * 60 + +newTime[1];
}
