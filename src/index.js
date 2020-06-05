/** 时间轴对象 */
var axis = {};

/** 当前页面url */
var url;

/** 正则匹配时间轴节点 */
var reg = new RegExp(/abps\-sub-([0-9]*)/);

/** 缓存判断结果 - 播放器是否加载完毕 */
var isLoad = false;

/** 缓存判断结果 - 根节点是否已创建 */
var isRender = false;

/** class目标 B站时间节点 - 用于判断播放器加载情况 */
const timeT = "bilibili-player-video-time-total";

/** class目标 播放器快照根节点 - 用于插入描述子节点 */
const descTimeParentT = "bilibili-player-video-progress-detail-img";

/** class目标 播放器快照样式 白嫖复用B站样式 */
const descTimeT = "bilibili-player-video-progress-detail-time";

/** class目标 B站播放器进度条节点 - 用于插入时间轴子节点 */
const progressT = "bilibili-player-video-progress";

/** 样式 -时间节点高度 */
const timeLineHeight = 8;

/** 样式 -时间节点宽度 */
const timeLineWidth = 4;

/** 样式 -时间节点颜色 */
const timeLineColor = "red";

/**
 * 入口函数
 * @param {*} event 系统传参
 */
function main(event) {
	reset();
	isLoaded() && render();
	showDesc(isTimeLine(event));
}

/** 监听鼠标移出 */
document.addEventListener("mouseover", main, {
	capture: true,
	passive: true,
});

/** 条件判断 - 判断播放器是否加载完毕 */
function isLoaded() {
	return (
		isLoad || document.getElementsByClassName(timeT)[0].innerText !== "00:00"
	);
}

/** 条件判断 - 判断是否已创建根节点 */
function isRendered() {
	return isRender || !!document.getElementsByClassName("abps").length;
}

/**
 * 条件判断 - 鼠标指向节点是否是时间轴节点
 * @param {*} e 系统传参
 */
function isTimeLine(e) {
	const index = e.target.className.replace(reg, "$1");
	const coordinates = axis;
	return coordinates[Object.keys(coordinates)[index]] || "";
}

/** 页面切换 重置参数 */
function reset() {
	if (url !== location.href) {
		isLoad = false;
		isRender = false;
		url = location.href;
		axis = {};
	}
}

/** 渲染入口 */
function render() {
	isLoad = true;
	!isRendered() ? _render() : "";
}

/** 渲染 [初始化用 仅调用一次] */
function _render() {
	_appendStyle();
	_getAxis();
	_createDescNode();
	isRender = true;
}

/** 注入css 预留 考虑变量 [初始化用 仅调用一次] */
function _appendStyle() {
	// new_element = document.createElement("style");
	// new_element.innerHTML = `.abps {height: ${
	// 	timeLineHeight + "px"
	// };display: flex;position:absolute;width: 100%;left:0} [class^="abps-sub-"] {width: ${timeLineWidth}px;height: ${timeLineHeight}px;background-color: ${timeLineColor};border-radius:5px}`;
	// document.body.appendChild(new_element);
}

/** 创建描述节点 [初始化用 仅调用一次] */
function _createDescNode() {
	let newnode = document.createElement("DIV");
	newnode.classList.add(`abps-desc`);
	newnode.classList.add(descTimeT);
	document.getElementsByClassName(descTimeParentT)[0].appendChild(newnode);
}

/** 创建根节点 [初始化用 仅调用一次] */
function _createParentNode() {
	document
		.getElementsByClassName(progressT)[0]
		.children[0].appendChild(appendChildNode());
}

/** 创建根节点 */
function createParentNode() {
	let newnode = document.createElement("DIV");
	newnode.classList.add("abps");

	return newnode;
}

/** 添加时间轴 */
function appendChildNode() {
	let coordinates = Object.keys(axis).sort();
	if (!coordinates.length) return;

	let lastTime = 0;
	let childNode = document.createElement("DIV");
	let parentNode = createParentNode();
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
			childNodeCopy.style.marginLeft = `calc(${z * 100 + "%"} - ${
				timeLineWidth / 2
			}px - ${((count ? 1 : 0) * timeLineWidth) / 2}px)`;
			childNodeCopy.classList.add(`abps-sub-${count}`);
			parentNode.appendChild(childNodeCopy);
			lastTime = currentTime;
			count++;
		}
	}
	return parentNode;
}

/**
 * 展示对应时间节点的描述
 * @param {String} desc 需要展示的描述
 */
function showDesc(desc) {
	document.getElementsByClassName("abps-desc")[0].innerText = desc;
}

/** 获取当前页面的时间轴 */
function _getAxis() {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let req = JSON.parse(xhr.responseText);
			// 请求过程中切换页面阻止渲染
			if (req.data[0].url !== location.href) return;
			axis = JSON.parse(req.data[0].axis);
			_createParentNode();
		}
	};
	xhr.open(
		"GET",
		`http://localhost:3008/timeline?query={"where":{"url":"${url}"}}`,
		true
	);
	xhr.send();
}

/**
 * 解析时间格式 例 "15:39"
 * @param {string} time /(\w\w):(\w\w)/
 */
function parseTime(time) {
	let newTime = time.split(":");
	return +newTime[0] * 60 + +newTime[1];
}
