import { Dimensions, Platform } from 'react-native';
import NormalizeSize from './NormalizeSize'; 

export const metrics = {
	buttonHeightWhereAmI: NormalizeSize.normalize(70),
	buttonWidthWhereAmI: NormalizeSize.normalize(100),
	buttonMarginWherAmI: NormalizeSize.normalize(7),
	bannerHeightRemind: NormalizeSize.normalize(30),
	inputWidthDetails: NormalizeSize.normalize(150),

	messagePullContainerPadding: NormalizeSize.normalize(3),
	messagePullContainerMarginLeftRight: NormalizeSize.normalize(15),
	messagePullContainerMarginTop: NormalizeSize.normalize(10),
	messagePullContainerPadding: NormalizeSize.normalize(3),

	inputLocationMarginVertical: NormalizeSize.normalize(1),

	remindContainerMarginTop: NormalizeSize.normalize(10),

	widthPicker: NormalizeSize.normalize(100),
	marginLeftPicker : NormalizeSize.normalize(230),





	/**PAGE LOCATION*/
	heightButtonStatus : NormalizeSize.normalize(40),
	widthButtonStatus : NormalizeSize.normalize(115),
	marginTopButtonStatus : NormalizeSize.normalize(-10),
	paddingButtonStatus :NormalizeSize.normalize(2),
	marginLeftStatusText : NormalizeSize.normalize(6),
	heightButtonCanarin : NormalizeSize.normalize(40),
	widthButtonCanarin : NormalizeSize.normalize(95),
	marginTopButtonCanarin : NormalizeSize.normalize(-10),
	paddingButtonCanarin :NormalizeSize.normalize(2),

	
	/**PAGE HISTORY*/
	titleMarginLeftInCharge : NormalizeSize.normalize(25),
	titleMarginLeftOnOff : NormalizeSize.normalize(15),
	subtitleMarginLeftInCharge : NormalizeSize.normalize(25),
	subtitleMarginLeftOnOff : NormalizeSize.normalize(15),
	
	/**PAGE DETAILS STATUS*/



	/**PAGE DETAILS*/
	marginButtonDelete : NormalizeSize.normalize(30),


	/**PAGE ADD STATUS*/



	/**PAGE ADD ACTIVITY*/
	widthPicker : NormalizeSize.normalize(160),
	heightPicker : NormalizeSize.normalize(50),
	listItemPaddingTop : NormalizeSize.normalize(10),
	listItemPaddingRight : NormalizeSize.normalize(10),
	listItemPaddingBottom : NormalizeSize.normalize(10),
	listItemBorderBottomWidth : NormalizeSize.normalize(1),
	listContainerMarginTop : NormalizeSize.normalize(20),
	listContainerBorderTopWidth : NormalizeSize.normalize(1),
	leftContainerMarginLeft : NormalizeSize.normalize(18)

}