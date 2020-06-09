/** 时间轴对象 */
var axis = {};

/** 当前页面url */
var url;

/** 正则 - 时间轴节点 */
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

/** class目标 视频简介 type = [bangumi] [0].childNodes[1].innerHTML*/
const descT_B = "media-desc";

/** class目标 视频简介 type = [video] [0].innerHTML*/
const descT_V = "info";

/** class目标 置顶评论 [1].parentNode.innerHTML*/
const descT_T = "stick";

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
function _createParentNode(data, type) {
	axis = data;
	document
		.getElementsByClassName(progressT)[0]
		.children[0].appendChild(appendChildNode());
	console.log(
		`%c Airborne: \n %c axis render success \n  from : ${type}`,
		"color:#66ccff",
		"color:#66cc00"
	);
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

/** 获取时间轴 - 从简介获取时间轴 */
function _getAxis() {
	console.log("%c Browser Plugin - Airborne \n link start!", "color:#66ccff");
	searchDesc();
}

/** 尝试从简介获取时间轴 未发现则从置顶获取 */
function searchDesc() {
	console.log(
		"%c Airborne - step 1 \n %c start search desc...",
		"color:#66ccff",
		"color:#66cc00"
	);
	let desc,
		nodeT,
		_axis = {};
	if (/\/bangumi\//g.test(url)) {
		nodeT = document.getElementsByClassName(descT_B)[0].childNodes;
		desc = nodeT.length ? nodeT[1].innerHTML : "";
	} else {
		nodeT = document.getElementsByClassName(descT_V);
		desc = nodeT.length ? nodeT[1].innerHTML : "";
	}
	if (desc && /\$空降坐标/g.test(desc)) {
		_axis = parseAxis(desc);
	}
	_axis.length ? _createParentNode(_axis, "desc") : searchTop();
}

/** 尝试从置顶获取时间轴 未发现则从服务器获取 */
function searchTop() {
	console.log(
		"%c Airborne - step 2 \n %c desc - miss, start search top...",
		"color:#66ccff",
		"color:#66cc00"
	);
	let desc,
		nodeT,
		_axis = {};
	nodeT = document.getElementsByClassName(descT_T);
	desc = nodeT.length ? nodeT[1].parentNode.innerHTML : "";

	desc = "$空降坐标\n" + desc + "\n$over";
	if (desc && /\$空降坐标/g.test(desc)) {
		_axis = parseAxis(desc);
	}

	_axis.length ? _createParentNode(_axis, "top") : searchServer();
}

/** 尝试从服务器获取时间轴 未发现则终止 */
function searchServer() {
	console.log(
		"%c Airborne - step 3 \n %c top - miss,start search server...",
		"color:#66ccff",
		"color:#66cc00"
	);
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.status === 200) {
			let req = JSON.parse(xhr.responseText);
			console.log("req :>> ", req);
			// 请求过程中切换页面阻止渲染
			if (req.data[0].url !== location.href) return;
			_createParentNode(JSON.parse(req.data[0].axis), "server");
		} else {
			console.log(
				"%c Airborne: \n %c axis not found",
				"color:#66ccff",
				"color:red"
			);
		}
	};
	xhr.open(
		"GET",
		`https://api.abps.group/timeline?query={"where":{"url":"${url}"}}`,
		true
	);
	xhr.send();
}

/**
 * 展示对应时间节点的描述
 * @param {String} desc 需要展示的描述
 */
function showDesc(desc) {
	document.getElementsByClassName("abps-desc")[0].innerText = desc;
}

/**
 * 解析时间格式 例 "15:39"
 * @param {string} time /(\w\w):(\w\w)/
 */
function parseTime(time) {
	let newTime = time.split(":");
	return +newTime[0] * 60 + +newTime[1];
}

/**
 * 时间轴解析
 * @param {string} desc innerHtml时间轴
 */
function parseAxis(desc) {
	let _desc, _node;
	_axis = {};
	_desc = desc.split("\n");
	_desc
		.slice(_desc.indexOf("$空降坐标") + 1, _desc.indexOf("$over") - 1)
		.map((v) => {
			_node = v.split(" ");
			_axis[_node[0]] = _node.slice(1).join(" ");
		});
	return _axis;
}
