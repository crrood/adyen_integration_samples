//////////////////////////
//		Constants		//
//////////////////////////

// set to class names for node states
const stateEnum = {
	INACTIVE: "inactive-state",
	ACTIVE: "active-state",
	PREVIOUS: "previous-state",
	UNREACHABLE: "unreachable-state"
};


//////////////////////////////
//		Flowchart Class 	//
//////////////////////////////
export default class Flowchart {

	constructor(inputArray, targetElement) {
		this.nodes = {};
		this.rootNode = this.generateTreeStructure(inputArray, null);

		this.attachToDOM(targetElement);

		this.initialHeight = targetElement.getBoundingClientRect().height;
		window.onresize = this.scale.bind(this);
	}

	// automated tree generator
	//
	// takes an array as an input, of the form
	// [
	//		rootNode,
	//	 	[
	//			node1,
	//	 		node2,
	//			[
	//				node3
	//			]
	//		]
	// ]
	// where node1 and node2 are children of rootNode
	// and node3 is a child of node2
	generateTreeStructure(inputArray, parentNode) {
		let targetNode = null;
		inputArray.map(arrayItem => {
			if (typeof(arrayItem) === "string") {
				// arrayItem is a node
				targetNode = new FlowchartNode(arrayItem);
				this.nodes[targetNode.id] = targetNode;

				// parentNode will be null for root node
				if (parentNode != null) {
					targetNode.setParent(parentNode);
				}
			}
			else {
				// arrayItem is a subtree
				// there will always be a string in the array before a subtree
				// so targetNode will always be set
				this.generateTreeStructure(arrayItem, targetNode);
			}
		});

		// will return the root node to the first call in the stack
		return targetNode;
	}

	// add generated HTML to page
	attachToDOM(targetElement) {
		targetElement.appendChild(this.rootNode.generateHTML());
		this.initialHeight = targetElement.getBoundingClientRect().height;
	}

	// dynamically scale flowchart width and height
	// adjusting layout relies on original height being passed to constructor
	// ** full of magic numbers BOOOO!!! **
	scale() {
		const FLOWCHART_MIN_WIDTH = 750;
		const availableFlowchartWidth = window.innerWidth / 2;

		if (availableFlowchartWidth < FLOWCHART_MIN_WIDTH) {

			// determine new scale values
			const el = document.querySelector(".flowchart");
			const scale = availableFlowchartWidth / FLOWCHART_MIN_WIDTH;
			const percentScaleX = "-" + (100 - (scale * 110)).toString() + "%";
			const percentScaleY = "-" + (100 - (scale * 120)).toString() + "%";

			// apply css transformation
			el.style.webkitTransform = `scale(${scale}) translate(${percentScaleX}, ${percentScaleY})`;

			// scale style.height to adjust layout
			if (this.initialHeight) {
				el.style.height = (this.initialHeight * scale) + "px";
			}
		}
		else {
			// if it's larger, CSS will expand it automatically
			document.querySelector(".flowchart").style.webkitTransform = "";
		}
	}

	// update the active, previous, and unreachable states for the chart
	setActive(activeNodeID) {
		this.nodes[activeNodeID].setActive();
	}
}


//////////////////////////////////
//		FlowchartNode Class 	//
//////////////////////////////////
class FlowchartNode {

	// set default values
	constructor(text) {
		this.text = text;
		this.id = text.replace(/ /g, "");
		this.parent = null;
		this.children = [];

		this.domElement = document.createElement("code");
		this.domElement.id = this.id;
		this.domElement.textContent = this.text;
		this.setState(stateEnum.INACTIVE);
	}

	// set parent reference
	// and parent's child to this
	setParent(parentNode) {
		if (parentNode instanceof FlowchartNode) {

			// set parent reference
			this.parent = parentNode;

			// update parent's child reference to this
			if (!parentNode.children.includes(this)) {
				parentNode.addChild(this);
			}
		}
		else {
			throw new TypeError("parentNode must be instance of class FlowchartNode");
		}
	}

	// add child reference
	// and child's parent to this
	addChild(childNode) {
		if (childNode instanceof FlowchartNode) {

			// sets child reference
			this.children.push(childNode);

			// updates child's parent reference to include this
			if (childNode.parent != this) {
				childNode.setParent(this);
			}
		}
		else {
			throw new TypeError("childNode must be instance of class FlowchartNode");
		}
	}

	// get this node's parents other children
	getSiblings() {
		if (this.parent === null) {
			return [];
		}

		// add all of parent's children != this to array
		const siblings = [];
		this.parent.children.map(child => {
			if (child != this) {
				siblings.push(child);
			}
		});

		// return array
		return siblings;
	}

	// set this node to active
	// set all ancestor nodes to previous
	// set all sibling nodes to unreachable
	setActive() {
		// set this to active
		this.setState(stateEnum.ACTIVE);

		// set all ancestors to previous
		let parentNode = this.parent;
		while (parentNode != null) {
			parentNode.setPrevious();
			parentNode = parentNode.parent;
		}

		// set all siblings to unreachable
		this.getSiblings().map(siblingNode => siblingNode.setUnreachable());
	}

	// set this node to previous
	setPrevious() {
		this.setState(stateEnum.PREVIOUS);
	}

	// set this Node to inactive
	setInactive() {
		this.setState(stateEnum.INACTIVE);
	}

	// set this and all child nodes to unreachable
	setUnreachable() {
		this.setState(stateEnum.UNREACHABLE);

		// make all child nodes unreachable
		this.children.map(child => child.setUnreachable());
	}

	// shared state change actions
	setState(newState) {
		this.domElement.classList.remove(this.state);
		this.domElement.classList.add(newState);
		this.state = newState;
	}

	// generate string with HTML for this and all descendant nodes
	generateHTML() {
		const liEl = document.createElement("li");
		liEl.appendChild(this.domElement);
		if (this.children.length > 0) {
			const ulEl = document.createElement("ul");
			this.children.map(child => ulEl.appendChild(child.generateHTML()));
			liEl.appendChild(ulEl);
		}

		return liEl;
	}
}
