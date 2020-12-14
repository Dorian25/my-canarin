import React, {Dimensions} from 'react-native';

//we set our base mobile device height
const base_unit_height = 683;

//we set our base mobile device width
const base_unit_width = 411;

//we get the size of the actual mobile device
const widthDevice = Dimensions.get('window').width;
const heightDevice = Dimensions.get('window').height;

class NormalizeSize {

	constructor() {
		this.normalize = this.normalize.bind(this);
	}

	normalize(size) {
		return (size / base_unit_height) * Math.floor(heightDevice);
	}

}

module.exports = new NormalizeSize();