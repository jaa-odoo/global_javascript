var gBackToCat;
var gCategoryId;
var gEnsembleId;
var CARE = "care";
var DETAILS = "details";
var FIT = "fit";
var gGetSizeFlag = false;
var displayOutfitModule = true;
var gclearanceFlag = "N";
var gCoreCatBrowse = "N";
var gPathInfo;
var gCatPath;
var gCs;
var gProductVaraintId;
var gcmReferrer;
var gClearanceSeparatorIndex = 0;
var colorPrices = new priceSet();
var colorsLoaded = false;
var mpColorPrices = new Array();
var mpColorsLoaded = new Array();
var editReturnType = "";
var primaryCategoryName;
var swatchImageMonogramSrc = "";
var PP = jQuery('#dossier').hasClass('PP'); //set true if standalone Product Page
var PPL = jQuery('#fbBox #dossier').hasClass('PPL'); //set true if Product Page Layer
if (PPL){
	var eob = jQuery('#fbBox #dossier').hasClass('eob'); // set true if eob page and PPL
	var soldOut = jQuery('#fbBox #dossier').hasClass('soldout'); //set true if soldout and PPL
	var editMode = jQuery('#fbBox #dossier').hasClass('EDIT'); //set true if soldout and PPL			
}else{
	var eob = jQuery('#dossier').hasClass('eob'); // set true if eob page
	var soldOut = jQuery('#dossier').hasClass('soldout'); //set true if soldout
	var editMode = jQuery('#dossier').hasClass('EDIT'); //set true if soldout
}		
if (PPL){
	var targetPage = '#fbBox #dossier.PPL ';
}else{
	var targetPage = '#dossier ';
}
//BUG00002
var checkFirstActiondoRootCopyText = true;

var gMonogram_eobFlag = "false";
var gMonogram_dept = "";
var gMonogram_effort = "";
var gMonogram_itemNbr = "";
var gMonogram_pageType = "";

var changeMonogramColorMode = ""; // This is a flag for onChange of color

var clearMonogramSettings = function() {
    gMonogram_eobFlag = "false";
    gMonogram_dept = "";
    gMonogram_effort = "";
    gMonogram_itemNbr = "";
    gMonogram_pageType = "";
};

var setEditReturnType = function(value) {
  editReturnType = value;
};

var getEditReturnType = function() {
  return editReturnType;
};

var rewirteUrl = function(url){
	var httpProtocol = location.protocol;
	var hostname = window.location.hostname;
	var is_safari = navigator.userAgent.indexOf("Safari") > -1;
	if (is_safari) {
		var pdpURL = httpProtocol + "//" + hostname + url;
	}else{
		var pdpURL = httpProtocol + url;
	}
	return pdpURL;	
};

var afterPPLOpenCallback = function(){
	jQuery.fn.ProductModule();
	MagicZoomPlus.refresh();
}

//new open product page layer function
var openPPL = function(url,type,params,callbacks){
	if (url !=""){
		var pplURL = url; // required
		var pplType = 'ajax'; // default
		var pplParams = ''; // required
		var pplCallBacks = callbacks; // optional
		initProductModuleFlag = false;
		if(type == "iframe"){
			pplType = type;
		}
		if (params !=""){
			pplParams = pplParams + 'type:'+ pplType + ' ' + params;
		}
		if (callbacks !=""){
			pplParams = pplParams + ' afterItemStart:afterPPLOpenCallback(); ' + pplCallBacks; // set default productmodule init
		}else{
			pplParams = pplParams + ' afterItemStart:afterPPLOpenCallback();';
		}
		if (pplURL !="" && pplParams !=""){
			fb.start(pplURL, pplParams);
		}else{
			alert("Error: Could not open the Product Page Layer");
		}	
	}else{
		alert("Error: Product Page Layer URL was not passed");
	}
};


// var responseSuccess = function(o) {}; --> logic moved directly into callbacks

var responseFailure = function(o) {
//	alert("Error occured in : " + o.argument.processType + "\n" + "Status Code: " + o.status + "\n" + "More Details: " + o.statusText + "\n" + "ajaxCallBackAddedItemToCartTimeOut: " + ajaxCallBackAddedItemToCartTimeOut);
};

//CATNAV:check product availablity
var callbackCheckProductAvailable =
{
	success : processProductAvailable,
	failure : responseFailure,
	argument: { processType:"getProductStyles" },
	timeout: ajaxCallBackEnsemblePricesTimeOut
};

isProductAvailable = function(ensembleId, clearanceFlag) {
	 var queryStr = getBaseURL() + "/ajax/get_product_styles.jsp?ensembleId=" + ensembleId ;

	 if (clearanceFlag != undefined && clearanceFlag != null)
		 queryStr = queryStr + "&clearanceFlag=" + clearanceFlag;
	 
	 if ($("cacheKey") != undefined && $("cacheKey") != null) {
		 var cacheKey = $("cacheKey").value;
		 queryStr = queryStr + "&cacheKey="+escape(cacheKey);
	 }
	 
	 if ($("cacheQueryString") != undefined && $("cacheQueryString") != null) {
		 var cacheQueryStr = $("cacheQueryString").value;
		 queryStr = queryStr + "&cacheQStr="+escape(cacheQueryStr);
	 }
	 var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackCheckProductAvailable);
};

function processProductAvailable(o) {
	var x = eval('(' + o.responseText + ')');
	var availableStylesFlag = x.availableStylesFlag;
	var ensembleId = x.ensembleId;
	
	if (availableStylesFlag == false) {		
		// SHOW the SOLDOUT DIV
		jQuery("#cell_"+ensembleId).removeClass('soldout');
		jQuery("#cell_"+ensembleId).addClass('soldout');
		jQuery("#productinfo_link_"+ensembleId).hide();
		jQuery("#productinfo_nolink_"+ensembleId).show();
		jQuery("#pid_"+ensembleId+"_url").removeAttr("href");
		jQuery("#pid_"+ensembleId+"_url").attr("href", "#");
	} else {		
		// navigate to the product page.
		var url = $("pid_"+ensembleId).value;		
		window.location.href = url;
	}
}

function getProductId() {
	return getValueFromElements('cut');
}

function getEnsemblePrices(idx) {
	if (idx == undefined) {
		var eobFlag = getValueFromElement('eob');
		var pageType = getValueFromElement('pageType');
		var workEnsembleId = shownEnsembleId;
		var displayClearaceVariants = getValueFromElement('displayClearaceVariants');
		var clearanceFlag = getValueFromElement('clearanceCategory');
		if (eobFlag == "true") {
			workEnsembleId = getValueFromElement('ensembleId');
            if (pageType == "MATCHMATCH") {
				webEnsembleId = getValueFromElement('webEnsembleId');
			}
		}
		colorPrices = null;
		colorPrices = new priceSet();
		colorPrices.getColorPrices(workEnsembleId, eobFlag, clearanceFlag, displayClearaceVariants, pageType);
	} else {
		if (mpColorPrices == null) {
			mpColorPrices = new Array();
		}
		var workEnsembleId = $('ensembleId_' + idx);
		mpColorPrices[idx] = new priceSet();
		mpColorPrices[idx].getColorPrices(workEnsembleId.value, false, false, false, "", idx);
	}

}

function getClxEnsemblePrices(idx) {
	if (idx == undefined) {
		var eobFlag = getValueFromElement('eob');
		var pageType = getValueFromElement('pageType');
		var workEnsembleId = shownEnsembleId;
		var displayClearaceVariants = getValueFromElement('displayClearaceVariants');
		var clearanceFlag = getValueFromElement('clearanceCategory');
		if (eobFlag == "true") {
			workEnsembleId = getValueFromElement('ensembleId');
            if (pageType == "MATCHMATCH") {
				webEnsembleId = getValueFromElement('webEnsembleId');
			}
		}
		colorPrices = null;
		colorPrices = new priceSet();
		colorPrices.getColorPrices(workEnsembleId, eobFlag, clearanceFlag, displayClearaceVariants, pageType);
	} else {
		if (mpColorPrices == null) {
			mpColorPrices = new Array();
		}
		var workEnsembleId = $('ensembleId_' + idx);
		mpColorPrices[idx] = new priceSet();
		mpColorPrices[idx].getColorPrices(workEnsembleId.value, false, false, false, "", idx);
	}

}

function getColorsLoadedFlag(idx) {
	if (idx == null) {
		return (colorsLoaded == null ? false : colorsLoaded);
	} else {
		return (mpColorsLoaded == null ? false : (mpColorsLoaded[idx] == null ? false : mpColorsLoaded[idx]));
	}
}

function processEnsemblePrices(o) {
    var ensembleIndex = colorPrices.processColorPrices(o, colorPrices, mpColorPrices);
	// We are on the single page.
    if (getColorsLoadedFlag(ensembleIndex)) {
		var currentColorId = getValueFromElement("color" + (ensembleIndex == null ? "" : "_" + ensembleIndex));
        if (currentColorId == null || currentColorId.length == 0 || currentColorId == "null") {
            var x = eval('(' + o.responseText + ')');
            var eob = x.eob;
            //ENH00191.  Default EOB price should be set to the highest price price range available.
            //           The price in the first swatches.
            currentColorId = getValueFromElement("defaultColorId");
        }
        //ENH00191 - pass in eob obj to distinguish eob/non-eob logic
        changeProductLabel(currentColorId, ensembleIndex, eob );
//        changeProductLabel(currentColorId, ensembleIndex);
	}
}

function getName() {
	var clearanceFlag = getValueFromElement('displayClearaceVariants');
	var productNameLabel = $("name").value;
	if (clearanceFlag == "true")
		productNameLabel += " CLEARANCE";

	return  productNameLabel;
}

function getDescription() {
	return  $("desc").innerHTML;
}

function getChannelCodeDesc() {
	var channelCodeNode = $("channelCodeDesc");
	var channelCode = '';

	if (channelCodeNode != undefined)
		channelCode = channelCodeNode.value;

	return channelCode;
}

function getProductPromoDescription() {
	return $("promo_desc").innerHTML;
}

function getProductPromoGroupDescription() {
	return $("promo_group_desc").innerHTML;
}

function getDesCodeLength() {
	var desCodeLengthNode = $("desCodeLength");
	var desCodeLength = '';

	if (desCodeLengthNode != undefined)
		desCodeLength = desCodeLengthNode.value;

	return desCodeLength;
}

function getDesCode(itemIndex) {
	var desCodeNode = $("desCode" + itemIndex);
	var desCode = '';

	if (desCodeNode != undefined)
		desCode = desCodeNode.value;

	return desCode;
}

function getDesCodeName(itemIndex) {
	var desCodeNameNode = $("desCodeName" + itemIndex);
	var desCodeName = '';

	if (desCodeNameNode != undefined)
		desCodeName = desCodeNameNode.value;

	return desCodeName;
}

function updateColorsAndSizes(currentlySelectedColor) {
	gGetSizeFlag = true;
    if (currentlySelectedColor != undefined)
        updateColors(currentlySelectedColor);
    else
        updateColors("-1");
}

/* ENH00038 Updates*/
function updateClxColorsAndSizes(currentlySelectedColorSize) {
    if (currentlySelectedColorSize != undefined)
        updateClxColorSizes(currentlySelectedColorSize);
    else
        updateClxColorSizes("-1");
}

function updateShownIn() {
	if (! $("defaultColorName") && $("defaultColorName").value == "null" || $("defaultColorName").value == "") {
		$("shownIn").innerHTML = 'Photo not available';
	} else {
		$("shownIn").innerHTML = 'Shown in: <strong>' + $("defaultColorName").value + '</strong>';
	}
}

function emailProduct(productEmailUrl) {
    cmCreateManualLinkClickTag(productEmailUrl,'Email to a Friend');
    openWindow(productEmailUrl,600,500,'status,scrollbars,resizable');
   // var pplURL = productEmailUrl;
	//var pplType = 'iframe';
	//var pplParams = 'autoFitHTML:true height:700 width:600 scrolling:no padding:0 panelPadding:20 outerClose:true controlsPos:tr';
	//var pplCallBacks = '';		
	//	openPPL(pplURL, pplType, pplParams, pplCallBacks);
}

var processCopyText = function(o) {
	var x = eval('(' + o.responseText + ')');
    if (x.version && x.version == "2") {
        processCopyTextVersion2(o);
    } else {

        var resLength = x.copyTextArr.length;
        var dlElement = $('infoModule');
        if (dlElement == null)
            var dl_timeout = setTimeout(function(){processCopyText(o);},300);
        var eobFlag = getValueFromElement('eob');
        var clearanceFlag = getValueFromElement('displayClearaceVariants');
        gclearanceFlag = clearanceFlag;
        var careExists = false;
        var fitExists = false;
        var detailsExists = false;
        var romanceExists = false;
        var romanceElement = null;
        var careElement = null;
        var fitElement = null;
        var detailsElement = null;
        if (!((resLength == undefined) || (resLength == 0))) {
            for (var i = 1; i <= resLength; i++) {
                if (x.copyTextArr[i - 1].type == "58") {
                    careExists = true;
                    careElement = doCare(x.copyTextArr[i - 1].tags, i);
                } else if (x.copyTextArr[i - 1].type == "52") {
                    detailsExists = true;
                    detailsElement = doDetail(x.copyTextArr[i - 1].tags, i);
                } else if (x.copyTextArr[i - 1].type == "59") {
                    fitExists = true;
                    fitElement = doFit(x.copyTextArr[i - 1].tags, i);
                } else if (x.copyTextArr[i - 1].type == "50") {
                    doRomance(x.copyTextArr[i - 1].tags, i);
                } else if (x.copyTextArr[i - 1].type == "26") {
                    doPromotion(x.copyTextArr[i - 1].tags);
                }
            }
        }

        dlElement.appendChild(doDefault());
        var remNode;
        if (careExists) {
            dlElement.appendChild(careElement);
        } else {
            remNode = document.getElementById(CARE);
            remNode.parentNode.removeChild(remNode);
        }
        if (detailsExists) {
            dlElement.appendChild(detailsElement);
        } else {
            remNode = document.getElementById(DETAILS);
            remNode.parentNode.removeChild(remNode);
        }

        if (fitExists) {
            dlElement.appendChild(fitElement);
        } else {
            remNode = document.getElementById(FIT);
            remNode.parentNode.removeChild(remNode);
        }
        updateAltButton();
        // process values for edits
        if (showSelectedValues) {
            showSelectedValues = false;
            var updateCountExpected = 2;
            if (giftBoxSelectedValues != undefined || giftBoxSelectedValues.length != undefined || giftBoxSelectedValues.length >= 6) {
                if (giftBoxSelectedValues[5] != "default" && giftBoxSelectedValues[4] != "default") {
                    updateCountExpected = 3;
                    selectValues("hemStyle", giftBoxSelectedValues[4]);
                    getInseamLength($("hemStyle"));
                }
                displaySelectedValues(updateCountExpected);
            }
        } else if (showSelectedValuesForEdit && itemForEditValues != null) {
            showSelectedValuesForEdit = false;
            var submitBtn = $("addToCart");

            if (isEditedItemFromWishList == true){
                if (submitBtn != undefined) {
                    YAHOO.util.Dom.setStyle(submitBtn, "visibility", "hidden");
                }
                var wishlistBtn = $("addToWishList");
                wishlistBtn.value = "Save To WishList";
            } else {
                submitBtn.value = "Save";
                var wishlistBtn = $("addToWishList");
                if (wishlistBtn != undefined) {
                    YAHOO.util.Dom.setStyle(wishlistBtn , "visibility", "hidden");
                }
            }

            YAHOO.ebauer.productUtils.buyAnotherClearVars();
            displayDefaultValuesOnEdit();
        } else if (showSelectedValuesForBuyAnotherItem && itemForEditValues != null) {
            //showSelectedValuesForBuyAnotherItem = false;
            YAHOO.ebauer.productUtils.buyAnotherClearVars();
            //BUG00248 - retain color/size info
            displayDefaultValuesOnEdit();
        }
        onCopyTextChange.fire();
        YAHOO.ebauer.productUtils.infoLoaded = true;
        YAHOO.ebauer.layerbox.checkProductLayerModules();
    }
};

var processCopyTextVersion2 = function(o) {
	var dlElement = $('infoModule');

	if (dlElement == null) {
        YAHOO.util.event.onContentReady('infoModule', processCopyText, o);
        return; // layer not ready, so above calls when ready
    }

    var x = eval('(' + o.responseText + ')');
	var resLength = x.copyTextArr.length;

    var eobFlag = getValueFromElement('eob');
	var clearanceFlag = getValueFromElement('displayClearaceVariants');
	gclearanceFlag = clearanceFlag;

    var detailsElement = null;
    var specElement = null;
    var rootCopyTextArray = new Array();

    if (!((resLength == undefined) || (resLength == 0))) {
        var k = 0;
        for (var i = 0; i < resLength; i++) {
            var currentCopyTextType = x.copyTextArr[i];

            if (currentCopyTextType.type == "52") {
                detailsElement = doRootCopyText(currentCopyTextType);
            } else if (currentCopyTextType.type == "81") {
                if (!detailsElement) {
                    specElement = doRootCopyText(currentCopyTextType);
                }
            } else if (currentCopyTextType.type == "50") {
				doRootCopyTextTemporary(currentCopyTextType, null, null, 'desc');
			} else if (currentCopyTextType.type == "26") {
                doRootCopyTextTemporary(currentCopyTextType, null, 'promoCopy', 'promo_desc');
			} else {
                rootCopyTextArray[k] = doRootCopyText(currentCopyTextType);
                k++;
            }
        }
        //BUG00002
        checkFirstActiondoRootCopyText = true;
	}

	dlElement.appendChild(doDefaultVersion2());

    if (!((resLength == undefined) || (resLength == 0))) {
        var k = 0;
        for (var i = 1; i <= resLength; i++) {
            if (x.copyTextArr[i - 1].type == "52") {
                dlElement.appendChild(detailsElement);
            } else if (!detailsElement && x.copyTextArr[i - 1].type == "81") {
                dlElement.appendChild(specElement);
            } else if (x.copyTextArr[i - 1].type != "50" && x.copyTextArr[i - 1].type != "26") {
                if (k < rootCopyTextArray.length){
                    dlElement.appendChild(rootCopyTextArray[k]);
                }

                k++;
            }
        }
    }

    updateAltButton();
	// process values for edits
	if (showSelectedValues) {
		showSelectedValues = false;
		var updateCountExpected = 2;
		if (giftBoxSelectedValues != undefined || giftBoxSelectedValues.length != undefined || giftBoxSelectedValues.length >= 6) {
			if (giftBoxSelectedValues[5] != "default" && giftBoxSelectedValues[4] != "default") {
				updateCountExpected = 3;
				selectValues("hemStyle", giftBoxSelectedValues[4]);
				getInseamLength($("hemStyle"));
			}
			displaySelectedValues(updateCountExpected);
		}
	} else if (showSelectedValuesForEdit && itemForEditValues != null) {
		showSelectedValuesForEdit = false;
		var submitBtn = $("addToCart");

		if (isEditedItemFromWishList == true){
			if (submitBtn != undefined) {
				YAHOO.util.Dom.setStyle(submitBtn, "visibility", "hidden");
			}
			var wishlistBtn = $("addToWishList");
			wishlistBtn.value = "Save To WishList";
		} else {
			submitBtn.value = "Save";
			var wishlistBtn = $("addToWishList");
			if (wishlistBtn != undefined) {
				YAHOO.util.Dom.setStyle(wishlistBtn , "visibility", "hidden");
			}
		}

		YAHOO.ebauer.productUtils.buyAnotherClearVars();
		displayDefaultValuesOnEdit();
	} else if (showSelectedValuesForBuyAnotherItem && itemForEditValues != null) {
		//showSelectedValuesForBuyAnotherItem = false;
		YAHOO.ebauer.productUtils.buyAnotherClearVars();
        //BUG00248 - retain color/size info
        displayDefaultValuesOnEdit();
	}
	onCopyTextChange.fire();
	YAHOO.ebauer.productUtils.infoLoaded = true;
	YAHOO.ebauer.layerbox.checkProductLayerModules();
};
var updateCount;
// This will keep track of updates happened due to AJAX.
function doDefaultVersion2() {
	//Set default main image
	var sku = getValueFromElement('SkuEobCatalogOnly');
	var eobFlag = getValueFromElement('eob');
	var pageType = getValueFromElement('pageType');
	var clearanceFlag = getValueFromElement('displayClearaceVariants');
	var dtElement = createTag('dt', null, null, null);
	var ddElement = createTag('dd', null, null, null);

	var textInfo = null;
	if (eobFlag != 'true' || pageType == 'MATCHMATCH') {
		var productPromoDescription = getProductPromoDescription();
		if (productPromoDescription != undefined && productPromoDescription != "" && productPromoDescription != "\n") {
			textInfo = createTag('span', null, null, null);
			textInfo.innerHTML = productPromoDescription;
			ddElement.appendChild(textInfo);
		}
		productPromoDescription = getProductPromoGroupDescription();
		if (productPromoDescription != undefined && productPromoDescription != "" && productPromoDescription != "\n") {
			var spanElement = createTag('span', null, null, null);
			spanElement.innerHTML = productPromoDescription;
			ddElement.appendChild(spanElement);
		}
	}
	textInfo = createTag('span', null, null, null);
	textInfo.innerHTML = getDescription();
	ddElement.appendChild(textInfo);

	if ($("dropShipItemFlag") != null && $("dropShipItemFlag").value == "true" ) {
		if ($("drop_ship_item_restricted_shipping_message") != null){
			textInfo = createTag('span','drop_ship_item_restricted_shipping_details_message', null, null);
			textInfo.innerHTML = $("drop_ship_item_restricted_shipping_message").innerHTML;
			ddElement.appendChild(textInfo);
		}
	
		if ($("drop_ship_item_restricted_shipping_details_src") != null){
			textInfo = createTag('div', 'drop_ship_item_restricted_shipping_details', null, null);
			textInfo.innerHTML = $("drop_ship_item_restricted_shipping_details_src").innerHTML;
			ddElement.appendChild(textInfo);
		}
	}

	var dlElement = createTag('dl', null, null, dtElement);
	dlElement.appendChild(ddElement);

	if (sku != '') {
		var spanElement = createTag('span', null, null, null);
		spanElement.innerHTML = sku;
		ddElement.appendChild(spanElement);
	}

	//var infoModuleInner = createTag('div', null, 'infoModuleInner', null);
    var infoModuleInner = $('infoModuleInner1');
    //BUG00002
    infoModuleInner.innerHTML = "";
    infoModuleInner.appendChild(dlElement);

	if (eobFlag != 'true') {
		var dlTag = createTag('dl', 'swatches', 'swatches', null);
		dlTag.appendChild(document.createTextNode(' '));
		var dlChangeColor = createTag('dl', 'change_col_text', 'swatches', null);
		var childDtEl = createTag('dt', null, null, null);
		var brElement = createTag('br');
		infoModuleInner.appendChild(brElement);
		childDtEl.appendChild(document.createTextNode('Change Color'));
		dlChangeColor.appendChild(childDtEl);
		infoModuleInner.appendChild(dlChangeColor);
		infoModuleInner.appendChild(dlTag);
		// CTL and YMAL tabs should not be displayed on clearance type product
		if (!showSelectedValues && !showSelectedValuesForBuyAnotherItem && clearanceFlag != 'Y') {
			infoModuleInner = $('infoModuleInner2');
			//BUG00002
			infoModuleInner.innerHTML = "";
			//var innerDtEle = createTag('dt', 'tabs', null, createTag('br', null, null, null));
			var innerDtEle = createTag('dt', 'tabs', null, document.createTextNode(' '));
			//var innerDdEle = createTag('dd', 'thumbs', null, createTag('br', null, null, null));
			var innerDdEle = createTag('dd', 'thumbs', null, document.createTextNode(' '));
			var innerDlEle = createTag('dl', 'alsoModule', null, null);
			innerDlEle.appendChild(innerDtEle);
			innerDlEle.appendChild(innerDdEle);
			infoModuleInner.appendChild(innerDlEle);
			var link = document.createTextNode("Get this entire look");
			var anchor = createDOM('a');
			anchor.appendChild(link);
			var div = createDOM('div', {'id':'outfit_link'});
			div.appendChild(anchor);
			infoModuleInner.appendChild(div);
		}
	} else {
		if (pageType == 'MATCHMATCH') {
			var dlTag = createTag('dl', 'swatches', 'swatches', null);
			dlTag.appendChild(document.createTextNode(' '));
			infoModuleInner.appendChild(dlTag);
			dlTag = createTag('dl', 'limited_avail_color', 'errorHide', null);
			infoModuleInner.appendChild(dlTag);
		}
		var innerDlEle = createTag('dl', 'eobModule', null, null);
		infoModuleInner.appendChild(innerDlEle);
	}
	// Initialize reg price
	var priceObjIndex = getIndexFromElements('cut');
	var priceObj = $("regPrice_" + priceObjIndex);
	if (priceObj != null && priceObj != undefined) {
		regPrice = priceObj.value;
	}

	if (eobFlag != 'true' || pageType == 'MATCHMATCH') {
		updateShownIn();
	}

    return $("infoModule0");
}

function doDefault() {
	//Set default main image
	var sku = getValueFromElement('SkuEobCatalogOnly');
	var eobFlag = getValueFromElement('eob');
	var pageType = getValueFromElement('pageType');
	var clearanceFlag = getValueFromElement('displayClearaceVariants');
	var dtElement = createTag('dt', null, null, null);
	var ddElement = createTag('dd', null, null, null);

	var textInfo = null;
	if (eobFlag != 'true' || pageType == 'MATCHMATCH') {
		var productPromoDescription = getProductPromoDescription();
		if (productPromoDescription != undefined && productPromoDescription != "" && productPromoDescription != "\n") {
			textInfo = createTag('span', null, null, null);
			textInfo.innerHTML = productPromoDescription;
			ddElement.appendChild(textInfo);
		}
		productPromoDescription = getProductPromoGroupDescription();
		if (productPromoDescription != undefined && productPromoDescription != "" && productPromoDescription != "\n") {
			var spanElement = createTag('span', null, null, null);
			spanElement.innerHTML = productPromoDescription;
			ddElement.appendChild(spanElement);
		}
	}
	textInfo = createTag('span', null, null, null);
	textInfo.innerHTML = getDescription();
	ddElement.appendChild(textInfo);

	if ($("dropShipItemFlag") != null && $("dropShipItemFlag").value == "true" ) {
		if ($("drop_ship_item_restricted_shipping_message") != null){
			textInfo = createTag('span', null, null, null);
			textInfo.innerHTML = $("drop_ship_item_restricted_shipping_message").innerHTML;
			ddElement.appendChild(textInfo);
		}
	
	    if ($("drop_ship_item_restricted_shipping_details_src") != null){
			textInfo = createTag('div', 'drop_ship_item_restricted_shipping_details', null, null);
			textInfo.innerHTML = $("drop_ship_item_restricted_shipping_details_src").innerHTML;
			ddElement.appendChild(textInfo);
		}
	}

	var dlElement = createTag('dl', null, null, dtElement);
	dlElement.appendChild(ddElement);

	if (sku != '') {
		var spanElement = createTag('span', null, null, null);
		spanElement.innerHTML = sku;
		ddElement.appendChild(spanElement);
	}

	var infoModuleInner = createTag('div', null, 'infoModuleInner', null);
	infoModuleInner.appendChild(dlElement);

	if (eobFlag != 'true') {
		var dlTag = createTag('dl', 'swatches', 'swatches', null);
		dlTag.appendChild(document.createTextNode(' '));
		var dlChangeColor = createTag('dl', 'change_col_text', 'swatches', null);
		var childDtEl = createTag('dt', null, null, null);
		var brElement = createTag('br');
		infoModuleInner.appendChild(brElement);
		childDtEl.appendChild(document.createTextNode('Change Color'));
		dlChangeColor.appendChild(childDtEl);
		infoModuleInner.appendChild(dlChangeColor);
		infoModuleInner.appendChild(dlTag);
		// CTL and YMAL tabs should not be displayed on clearance type product
		if (!showSelectedValues && !showSelectedValuesForBuyAnotherItem && clearanceFlag != 'Y') {
			//var innerDtEle = createTag('dt', 'tabs', null, createTag('br', null, null, null));
			var innerDtEle = createTag('dt', 'tabs', null, document.createTextNode(' '));
			//var innerDdEle = createTag('dd', 'thumbs', null, createTag('br', null, null, null));
			var innerDdEle = createTag('dd', 'thumbs', null, document.createTextNode(' '));
			var innerDlEle = createTag('dl', 'alsoModule', null, null);
			innerDlEle.appendChild(innerDtEle);
			innerDlEle.appendChild(innerDdEle);
			infoModuleInner.appendChild(innerDlEle);
			var link = document.createTextNode("Get this entire look");
			var anchor = createDOM('a');
			anchor.appendChild(link);
			var div = createDOM('div', {'id':'outfit_link'});
			div.appendChild(anchor);
			infoModuleInner.appendChild(div);
		}
	} else {
		if (pageType == 'MATCHMATCH') {
			var dlTag = createTag('dl', 'swatches', 'swatches', null);
			dlTag.appendChild(document.createTextNode(' '));
			infoModuleInner.appendChild(dlTag);
			dlTag = createTag('dl', 'limited_avail_color', 'errorHide', null);
			infoModuleInner.appendChild(dlTag);
		}
		var innerDlEle = createTag('dl', 'eobModule', null, null);
		infoModuleInner.appendChild(innerDlEle);
	}
	// Initialize reg price
	var priceObjIndex = getIndexFromElements('cut');
	var priceObj = $("regPrice_" + priceObjIndex);
	if (priceObj != null && priceObj != undefined) {
		regPrice = priceObj.value;
	}

	if (eobFlag != 'true' || pageType == 'MATCHMATCH') {
		updateShownIn();
	}
//	var infoModuleInner = createTag('div', null, 'infoModuleInner', outerDdElement)
	var outerDdElement = createTag('dd', 'infoModule0', 'active', infoModuleInner);
	return outerDdElement;
}


function doCare(x, seqNO) {
	var h5Element = createTag('h5', null, null, document.createTextNode('Care Instructions'));
	var dtElement = createTag('dt', null, null, null);
	dtElement.appendChild(h5Element);

	var ddParentElement = createTag('dd', null, null, null);
	var dlElement = createTag('dl', null, null, dtElement);
	dlElement.appendChild(ddParentElement);

	var childElement = null;
	for (var j = 0; j < x.length; j++)
	{
		childElement = createTag(x[j].tagType, null, null, null);
		childElement.innerHTML = x[j].text;
		ddParentElement.appendChild(childElement);
	}
	var infoModuleInner = createTag('div', null, 'infoModuleInner', dlElement);
	var ddElement = createTag('dd', 'infoModule1', 'hidden', infoModuleInner);
	return ddElement;
}

function doFit(x, seqNO) {
	var h5Element = createTag('h5', null, null, document.createTextNode('Fit'));
	var dtElement = createTag('dt', null, null, null);
	dtElement.appendChild(h5Element);

	var ddParentElement = createTag('dd', null, null, null);
	var dlElement = createTag('dl', null, null, dtElement);
	dlElement.appendChild(ddParentElement);

	var childElement = null;
	for (var j = 0; j < x.length; j++)
	{
		childElement = createTag(x[j].tagType, null, null, null);
		childElement.innerHTML = x[j].text;
		ddParentElement.appendChild(childElement);
	}
	var infoModuleInner = createTag('div', null, 'infoModuleInner', dlElement);
	var ddElement = createTag('dd', 'infoModule3', 'hidden', infoModuleInner);
	return ddElement;
}

function doRomance(x, seqNO) {
	var spanElement = createTag('span', null, null, null);
	var childElement = null;
	for (var j = 0; j < x.length; j++)
	{
		childElement = createTag(x[j].tagType, null, null, null);
		if (x[j].typeId != null && x[j].typeId == "53")
			childElement.innerHTML = x[j].text + ".";//adds a period after origin info
		else
			childElement.innerHTML = x[j].text + "&nbsp;";
		spanElement.appendChild(childElement);
	}
	$("desc").innerHTML = spanElement.innerHTML;
	var ddElement = createTag('dd', 'infoModule0', 'active', spanElement);
	return ddElement;
}

function doPromotion(x) {
	var spanElement = createTag('span', null, 'promoCopy', null);
	var childElement = null;
	for (var j = 0; j < x.length; j++)
	{
		childElement = createTag(x[j].tagType, null, 'promoCopy', null);
		childElement.innerHTML = x[j].text;
		spanElement.appendChild(childElement);
	}
	$("promo_desc").innerHTML = spanElement.innerHTML;
}

function doDetail(x, seqNO) {
	var channelCodeDesc = getChannelCodeDesc();
	var desCodeLengthValue = getDesCodeLength();
	var dtElement = null;

	if (channelCodeDesc.length > 0) {
		dtElement = createTag('dt', null, 'dca', null);
		dtElement.innerHTML = channelCodeDesc;
	} else {
		dtElement = createTag('dt', null, null, null);
	}

	var dlElement = createTag('dl', null, null, dtElement);

	var h5Element = createTag('h5', null, null, document.createTextNode('Product Details'));
	dtElement = createTag('dt', null, null, h5Element);
	dlElement.appendChild(dtElement);

	var bullUlElement = createTag('ul', null, 'bulleted', null);
	var ddLevelTwo = createTag('dd', null, null, bullUlElement);
	dlElement.appendChild(ddLevelTwo);

	var childElement = null;
	for (var j = 0; j < x.length; j++)
	{
		childElement = createTag(x[j].tagType, null, null, null);
		childElement.innerHTML = x[j].text;
		bullUlElement.appendChild(childElement);
	}

	var ddItemNumbers = createTag('dd', 'itemNumbersContainer', null, null);
	dlElement.appendChild(ddItemNumbers);

	for (var desCodeIndex = 1; desCodeIndex <= desCodeLengthValue; desCodeIndex++) {
		var spanElement = createTag('span', null, 'itemNumber clearfix', null);
		ddItemNumbers.appendChild(spanElement);

		var labelElement = createTag('label', null, 'itemNumberLabel', document.createTextNode(getDesCodeName(desCodeIndex) + ' '));
		spanElement.appendChild(labelElement);

		var prefixElement = createTag('span', null, 'itemNumberPrefix', document.createTextNode(' item # ' + (getDesCode(desCodeIndex))));
		spanElement.appendChild(prefixElement);

	}
	var infoModuleInner = createTag('div', null, 'infoModuleInner', dlElement);
	var ddElement = createTag('dd', 'infoModule2', 'hidden', infoModuleInner);
	return ddElement;
}

function doRootCopyText(currentCopyTextType) {
    if (currentCopyTextType) {
        var dlElement = createTag('dl', null, null, null);

        if ("typeIncludeChannelCodes" in currentCopyTextType && currentCopyTextType.typeIncludeChannelCodes == 'Y') {
            var channelCodeDesc = getChannelCodeDesc();

            if (channelCodeDesc && channelCodeDesc.length > 0) {
                var channelCodesDtElement = createTag('dt', null, 'dca', null);
                channelCodesDtElement.innerHTML = channelCodeDesc;
                dlElement.appendChild(channelCodesDtElement);
            }
        }

        var h5Element = createTag('h5', null, null, document.createTextNode(currentCopyTextType.typeHeader));
        var headerDtElement = createTag('dt', null, null, h5Element);
        dlElement.appendChild(headerDtElement);

        var copyTextDdElement = createTag('dd', null, null, null);
        copyTextDdElement.innerHTML = currentCopyTextType.copyTextHTML;
        dlElement.appendChild(copyTextDdElement);

        if ("typeIncludeItemNumber" in currentCopyTextType && currentCopyTextType.typeIncludeItemNumber == 'Y') {
            var desCodeLengthValue = getDesCodeLength();
            var itemNumberDdElement = createTag('dd', 'itemNumbersContainer', null, null);

            for (var desCodeIndex = 1; desCodeIndex <= desCodeLengthValue; desCodeIndex++) {
                var spanElement = createTag('span', null, 'itemNumber clearfix', null);
                itemNumberDdElement.appendChild(spanElement);

                var labelElement = createTag('label', null, 'itemNumberLabel', document.createTextNode(getDesCodeName(desCodeIndex) + ' '));
                spanElement.appendChild(labelElement);

                var prefixElement = createTag('span', null, 'itemNumberPrefix', document.createTextNode(' item # ' + (getDesCode(desCodeIndex))));
                spanElement.appendChild(prefixElement);
            }

            dlElement.appendChild(itemNumberDdElement);
        }

        var infoModuleInner = createTag('div', null, 'infoModuleInner ctt_' + currentCopyTextType.type, dlElement);
        var parentDdElement = createTag('dd', "infoModulecopytext_" + currentCopyTextType.type, 'hidden', infoModuleInner);
        var ulModuleThumbs = $('moduleThumbs');
        //BUG00002
        if(checkFirstActiondoRootCopyText){
        	checkFirstActiondoRootCopyText = false;
        	ulModuleThumbs.innerHTML = "";
        }
        var spanElement = createTag('span', 'copytext_name_' + currentCopyTextType.type, 'copytext_name', document.createTextNode(currentCopyTextType.typeName));
        var liElement = createTag('li', "copytext_" + currentCopyTextType.type, null, spanElement);
        ulModuleThumbs.appendChild(liElement);

        return parentDdElement;
    }
}

function doRootCopyTextTemporary(currentCopyTextType, spanId, spanClass, destinationElementId) {
	var spanElement = createTag('span', spanId, spanClass, null);
    spanElement.innerHTML = currentCopyTextType.copyTextHTML;
	$(destinationElementId).innerHTML = spanElement.innerHTML;
}

var colorIndex = 0;
var sizeIndex = 0;
var colorValue = null;
var sizeValue = null;
var colorsLength = 0;
var sizesLength = 0;

var processColors = function(o) {
    Count=0;
    var activeColorIdValue;
	var currentlySelectedColor = "-1";
    var currentlySelectedColorName = "";
	var selectedIndex = 0;
	var x = eval('(' + o.responseText + ')');
	var index = '';
	var isMultiProductPage = false;
	var forceColorChange = false;

	if (x.idx != undefined) {
		index = '_' + x.idx;
		isMultiProductPage = true;
		activeColorIdValue = $("activeColorId_" + x.idx).value;
	} else {
		currentlySelectedColor = x.selectedColorId;
		if (currentlySelectedColor > 0)
			forceColorChange = true;
        }
   	var colors = $("color" + index);
    //Get the Selected color into a variable.
    if(currentlySelectedColor >0)
    {
        for (var i = 1; i < colors.length; i++) {
            if(colors.options[i] != undefined && colors.options[i].value == currentlySelectedColor)
                currentlySelectedColorName = colors.options[i].text;
        }
    }
	colors.options[0] = new Option("Select Color", null);
	var length = 0;
	if (!(x.colors == undefined || x.colors.color == undefined)) {
		length = x.colors.color.length;
		// we need a separator in the color dropdown by price type - let's do a sort
		// x.colors.color.sort(sortByAlphaAndPriceTypeCLast);
	}
    colorsLength = length;
    colors.options.length =  colorsLength+1;
	var colorInventoryStatus = new Array(length + 1);
	// true if a clearance separator has already been added to the dropdown
	var addedClearanceSeparator = false;
	// use this as the option's index rather than "i + 1" because we may add a separator.
	// starts at 1 because "Select Color" is 0
	var optionIndex = 1;
	gClearanceSeparatorIndex = 0;

	for (var i = 0; i < length; i++) {
		// is this the first Clearance Price Type?  If so, then add a clearance separator
		if (!addedClearanceSeparator && "C" == x.colors.color[i].pricetypecode) {
			// if we only have Clearance items (i is 0), then don't separate
			if (i != 0) {
				colors.options[optionIndex] = new Option("------------Clearance------------", null);
				//colors.options[optionIndex].setAttribute('style', 'color:grey');
				colors.options[optionIndex].style.cssText += ';color:gray;';
				gClearanceSeparatorIndex = optionIndex;
				++optionIndex;
			}
			addedClearanceSeparator = true;
		}
		if ((isMultiProductPage && activeColorIdValue == x.colors.color[i].id) || (currentlySelectedColor == x.colors.color[i].id) ){
			selectedIndex = optionIndex;
		}
		colorInventoryStatus[optionIndex] = "ok";
		if (x.colors.color[i].inventory_status == undefined)
			colors.options[optionIndex] = new Option(x.colors.color[i].name, x.colors.color[i].id);
		else if (x.colors.color[i].inventory_status == "BO") {
			colors.options[optionIndex] = new Option(x.colors.color[i].name + " - " + getStatusDescription(x.colors.color[i].inventory_status, x.colors.color[i].available_quantity) + " " + x.colors.color[i].back_order_date + " ", x.colors.color[i].id);
			colorInventoryStatus[optionIndex] = x.colors.color[i].inventory_status;
		} else {
			colors.options[optionIndex] = new Option(x.colors.color[i].name + " - " + getStatusDescription(x.colors.color[i].inventory_status, x.colors.color[i].available_quantity) + " ", x.colors.color[i].id);
			colorInventoryStatus[optionIndex] = x.colors.color[i].inventory_status;
			if (x.colors.color[i].inventory_status == "SOLDOUT") {
				//colors.options[optionIndex].setAttribute('style', 'color:grey');
				colors.options[optionIndex].style.cssText += ';color:gray;';
			}
		}
		++optionIndex;
	}
    if(!isMultiProductPage)
        {
           if(currentlySelectedColor != -1 && selectedIndex == 0)
           {
               var humpColorErrorField = document.getElementById("hump_color_not_available");
			    if (humpColorErrorField != null) {
                    var errorText = humpColorErrorField.innerHTML.replace("[COLOR]", currentlySelectedColorName);
                    humpErrorField = document.getElementById("hump");
                    humpErrorField.innerHTML = errorText;
                    enableDisplay(humpErrorField);
                }
           }
           else
           {
                var humpErrorField = $("hump");
                //alert("isEnableDisplay(humpErrorField) : " + isEnableDisplay(humpErrorField));
                //alert("humpErrorField.innerHTML"+ humpErrorField.innerHTML);
                if (isEnableDisplay(humpErrorField) && humpErrorField.innerHTML.indexOf("Please select another color") > 0) {
                    disableDisplay(humpErrorField);
                }
           }
        }
	// Set initial size value
	var activeColorInventoryStatus = $("activeColorInventoryStatus_" + x.idx);
	if (activeColorInventoryStatus != undefined)
		activeColorInventoryStatus.value = colorInventoryStatus[selectedIndex];

	buildSwatches(x);

	if (gGetSizeFlag)
		updateSizes();

    // fires custom event that tells us the colors have loaded
	onColorChange.fire({
		isMPP:isMultiProductPage,
		length:length,
		selectedIndex:selectedIndex,
		xIdx:x.idx,
		selectObj:colors,
		invStatus:colorInventoryStatus,
        forceColorChange:forceColorChange,
        currentlySelectedColor:currentlySelectedColor
    });
	var mySelectedIndex = 0;
	var productForm = null;
	var pvId = $("productVariantId");
	var pvType = $("productVariantType");
	if (isMultiProductPage == true) {
		productForm = $("compareForm");
		mySelectedIndex = selectedIndex + 1;
		pvId = $("productVariantId_"+ x.idx);
	} else {
		productForm = $("productForm");
		mySelectedIndex = productForm.color.selectedIndex;
		mySelectedIndex = (mySelectedIndex > 0?mySelectedIndex:selectedIndex);
		if (gClearanceSeparatorIndex > 0 && mySelectedIndex > gClearanceSeparatorIndex) {
			mySelectedIndex--;
		}
	}
	if (x.colors.color.length >= mySelectedIndex && mySelectedIndex != 0 && x.colors.color[mySelectedIndex - 1] && x.colors.color[mySelectedIndex - 1].productVariantId != undefined) {
		if (pvId) {
			pvId.value = x.colors.color[mySelectedIndex - 1].productVariantId;
		}
		if (pvType && x.colors.color[mySelectedIndex - 1].productVariantType != undefined) {
			pvType.value = x.colors.color[mySelectedIndex - 1].productVariantType;
		}

		if ("C" == x.colors.color[mySelectedIndex - 1].pricetypecode) {
			gclearanceFlag = "Y";
		} else {
			gclearanceFlag = "N";
		}
	}
};

var processSizes = function (o) {
    //reset the array
    var activeSizeIdValue;
    var selectedIndex = 0;
    var x = eval('(' + o.responseText + ')');
    var isMultiProductPage = false;
    var isMultiSKUPants = false;

    if (x.idx != undefined) {
        sizes = $("size_" + x.idx);
        isMultiProductPage = true;
        activeSizeIdValue = $("activeSizeId_" + x.idx).value;
    }

    if (isMultiProductPage) {
        if (eval("document.compareForm.activeInseamFlag_" + x.idx).value == 'Y')
            isMultiSKUPants = true;
    }

    if ((document.forms[0].inseamFlag_1 != undefined && document.forms[0].inseamFlag_1.value == 'true') || isMultiSKUPants)
        sizes.options[0] = new Option("Select Waist Size", null);
    else
        sizes.options[0] = new Option("Select Size", null);

    var length = 0;
    if (!(x.sizes == undefined || x.sizes.size == undefined))
        length = x.sizes.size.length;
    sizesLength = length;
    var sizeInventoryStatus = new Array(length + 1);
    for (var i = 0; i < length; i++) {
        if (isMultiProductPage == true) {
            //if (activeSizeIdValue == x.sizes.size[i].id) {
            //	selectedIndex = i + 1;
            //}
        }
        if (x.sizes.size[i].inventory_status == undefined)
            sizes.options[i + 1] = new Option(x.sizes.size[i].name, x.sizes.size[i].id);
        else if (x.sizes.size[i].inventory_status == "BO") {
            sizes.options[i + 1] = new Option(x.sizes.size[i].name + " - " + getStatusDescription(x.sizes.size[i].inventory_status, x.sizes.size[i].available_quantity) + " " + x.sizes.size[i].back_order_date + " ", x.sizes.size[i].id);
            sizeInventoryStatus[i + 1] = x.sizes.size[i].inventory_status;
        } else {
            sizes.options[i + 1] = new Option(x.sizes.size[i].name + " - " + getStatusDescription(x.sizes.size[i].inventory_status, x.sizes.size[i].available_quantity) + " ", x.sizes.size[i].id);
            sizeInventoryStatus[i + 1] = x.sizes.size[i].inventory_status;
            if (x.sizes.size[i].inventory_status == "SOLDOUT") {
                //sizes.options[i + 1].setAttribute('style', 'color:grey');
                sizes.options[i + 1].style.cssText += ';color:gray;';
            }
        }
    }
    // Set initial size value
    var activeSizeInventoryStatus = $("activeSizeInventoryStatus_" + x.idx);
    if (activeSizeInventoryStatus != undefined)
        activeSizeInventoryStatus.value = sizeInventoryStatus[selectedIndex];

    // fires custom event that tells us the sizes have loaded
    onSizeChange.fire({
        isMPP: isMultiProductPage,
        length: length,
        selectedIndex: selectedIndex,
        xIdx: x.idx,
        selectObj: sizes,
        invStatus: sizeInventoryStatus
    });
    var mySelectedIndex = 0;
    var productForm = null;
    var pvId = $("productVariantId");
    var pvType = $("productVariantType");
    if (isMultiProductPage == true) {
        productForm = $("compareForm");
        mySelectedIndex = selectedIndex;
        pvId = $("productVariantId_" + x.idx);
    } else {
        productForm = $("productForm");
        mySelectedIndex = productForm.size.selectedIndex;
    }
    if (x.sizes.size.length >= mySelectedIndex && mySelectedIndex != 0 && x.sizes.size[mySelectedIndex - 1] && x.sizes.size[mySelectedIndex - 1].productVariantId != undefined) {
        if (pvId) {
            pvId.value = x.sizes.size[mySelectedIndex - 1].productVariantId;
        }
        if (pvType && x.sizes.size[mySelectedIndex - 1].productVariantType != undefined) {
            pvType = x.sizes.size[mySelectedIndex - 1].productVariantType;
        }
    }
    updateCount = 2;
    cY();
};

var colorsizeIndex = 0;
var colorsizeValue = null;

var processColorSizes = function(o) {
    Count = 0;
    var activeColorSizeIdValue;
	var currentlySelectedColorSize = "-1";
	var selectedIndex = 0;
    var selectedPvId = -1;
    var x = eval('(' + o.responseText + ')');
	var index = '';
    var isMultiProductPage = false;
    var forceColorChange = false;

    currentlySelectedColorSize = x.selectedColorSizeId;
    if (currentlySelectedColorSize != ''){
        forceColorChange = true;
    }

	var colorsizes = $("colorsize");
    if (document.forms[0].inseamFlag_1 != undefined && document.forms[0].inseamFlag_1.value == 'true'){
        colorsizes.options[0] = new Option("Select Color - Waist Size", null);
    } else {
        colorsizes.options[0] = new Option("Select Color - Size", null);
    }
    var length = 0;
	if (!(x.colorsizes == undefined || x.colorsizes.colorsize == undefined)) {
		length = x.colorsizes.colorsize.length;
	}
	var colorInventoryStatus = new Array(length + 1);
	// true if a clearance separator has already been added to the dropdown
	var addedClearanceSeparator = false;
	// use this as the option's index rather than "i + 1" because we may add a separator.
	// starts at 1 because "Select Color" is 0
	var optionIndex = 1;

	for (var i = 0; i < length; i++) {
        if (currentlySelectedColorSize == (x.colorsizes.colorsize[i].id + '-' + x.colorsizes.colorsize[i].sizeid)){
			selectedIndex = optionIndex;
            //TSK00626: Set the Product Variant ID as either -1 or the selected PV ID. The OrderUtil addItemToCart will figure-out productVariantId from color/size/ensembleId/productId.
            selectedPvId = x.colorsizes.colorsize[i].productVariantId;
        }
		colorInventoryStatus[optionIndex] = "ok";
		if (x.colorsizes.colorsize[i].inventory_status == undefined)
			colorsizes.options[optionIndex] = new Option(x.colorsizes.colorsize[i].name + ' - ' + x.colorsizes.colorsize[i].sizename, x.colorsizes.colorsize[i].id + '-' + x.colorsizes.colorsize[i].sizeid);
		else if (x.colorsizes.colorsize[i].inventory_status == "BO") {
			colorsizes.options[optionIndex] = new Option(x.colorsizes.colorsize[i].name + ' - ' + x.colorsizes.colorsize[i].sizename + " - " + getStatusDescription(x.colorsizes.colorsize[i].inventory_status, x.colorsizes.colorsize[i].available_quantity) + " " + x.colorsizes.colorsize[i].back_order_date + " ", x.colorsizes.colorsize[i].id + '-' + x.colorsizes.colorsize[i].sizeid);
			colorInventoryStatus[optionIndex] = x.colorsizes.colorsize[i].inventory_status;
		} else {
			colorsizes.options[optionIndex] = new Option(x.colorsizes.colorsize[i].name + ' - ' + x.colorsizes.colorsize[i].sizename + " - " + getStatusDescription(x.colorsizes.colorsize[i].inventory_status, x.colorsizes.colorsize[i].available_quantity) + " ", x.colorsizes.colorsize[i].id + '-' + x.colorsizes.colorsize[i].sizeid);
			colorInventoryStatus[optionIndex] = x.colorsizes.colorsize[i].inventory_status;
			if (x.colorsizes.colorsize[i].inventory_status == "SOLDOUT") {
				//colorsizes.options[optionIndex].setAttribute('style', 'color:grey');
				colorsizes.options[optionIndex].style.cssText += ';color:gray;';
			}
		}
		++optionIndex;
	}
	// Set initial size value
	var activeColorInventoryStatus = $("activeColorInventoryStatus_" + x.idx);
	if (activeColorInventoryStatus != undefined)
		activeColorInventoryStatus.value = colorInventoryStatus[selectedIndex];

	buildColorSizeSwatches(x);

//	if (gGetSizeFlag)
//		updateSizes();

    //TSK00626: Set the Product Variant ID as either -1 or the selected PV ID. The OrderUtil addItemToCart will figure-out productVariantId from color/size/ensembleId/productId.

	// fires custom event that tells us the colors have loaded
	onColorSizeChange.fire({
		isMPP:isMultiProductPage,
		length:length,
		selectedIndex:selectedIndex,
		xIdx:x.idx,
		selectObj:colorsizes,
		invStatus:colorInventoryStatus,
        forceColorChange:forceColorChange,
        currentlySelectedColor:currentlySelectedColorSize,
        selectPvId:selectedPvId
    });
	var mySelectedIndex = 0;
	var productForm = null;
	var pvId = $("productVariantId");
	var pvType = $("productVariantType");

    productForm = $("productForm");
    mySelectedIndex = productForm.colorsize.selectedIndex;
    mySelectedIndex = (mySelectedIndex > 0?mySelectedIndex:selectedIndex);

	if (x.colorsizes.colorsize.length >= mySelectedIndex && mySelectedIndex != 0 && x.colorsizes.colorsize[mySelectedIndex - 1] && x.colorsizes.colorsize[mySelectedIndex - 1].productVariantId != undefined) {
		if (pvId) {
			pvId.value = x.colorsizes.colorsize[mySelectedIndex - 1].productVariantId;
		}
		if (pvType && x.colorsizes.colorsize[mySelectedIndex - 1].productVariantType != undefined) {
			pvType.value = x.colorsizes.colorsize[mySelectedIndex - 1].productVariantType;
		}

		if ("C" == x.colorsizes.colorsize[mySelectedIndex - 1].pricetypecode) {
			gclearanceFlag = "Y";
		} else {
			gclearanceFlag = "N";
		}
	}
};

var sortByAlphaAndPriceTypeCLast = function(a, b) {
	var result = 0;
	var aIsClearance = (a.pricetypecode == 'C');
	var bIsClearance = (b.pricetypecode == 'C');

	if (aIsClearance == bIsClearance) {
		// if they are both C or both not C, then just sort alphabetically
		var aLowercaseName = a.name.toLowerCase();
		var bLowercaseName = b.name.toLowerCase();
		result = ((aLowercaseName < bLowercaseName) ? -1 : ((aLowercaseName > bLowercaseName) ? 1 : 0));
	} else {
		// else they are different price type codes, let's put C last
		result = aIsClearance ? 1 : -1;
	}

	return result;
};

function setMPPQuantity(idx) {
	var quantObj = $("quantity_" + idx);
	if (quantObj != null && quantObj.selectedIndex == 0) {
		$("quantity_" + idx).selectedIndex = '1';
	}
}
var tabSelected = -1;
function updateNodeAttributes(tagName, jsonProps)
{


}

var debugFailure = function(arg) {
	var p = arg.processType;
	if (p) {
		var newText = document.createTextNode("AJAX failure in processType:" + p);
		var alsoModule = $('alsoModule');
		var thumbs = $('thumbs');
		var parentNode = null;
		if (alsoModule) {
			parentNode = alsoModule.parentNode;
		} else if (thumbs) {
			parentNode = thumbs.parentNode;
		}
		if (parentNode) {
			parent.appendChild(newText);
		}
	}
}

var callbackColor =
{
	success : processColors,
	failure : responseFailure,
	argument: { processType:"color" },
	timeout: ajaxCallBackColorTimeOut
};

var callbackColorSize =
{
	success : processColorSizes,
	failure : responseFailure,
	argument: { processType:"colorsize" },
	timeout: ajaxCallBackColorTimeOut
};

var callbackOutFitModule =
{
	success : processOutFitModule,
	failure : responseFailure,
	argument: { processType:"outfitModule" },
  timeout: ajaxCallBackOutfitModuleTimeOut
};

var callbackOutFit =
{
	success : processOutFit,
	failure : responseFailure,
	argument: { processType:"outfit" },
	timeout: ajaxCallBackOutfitTimeOut
};

var callbackRelatedOutFit =
{
	success : processRelatedOutFits,
	failure : responseFailure,
	argument: { processType:"relatedoutfits" },
	timeout: ajaxCallBackRelatedOutfitTimeOut
};

var callbackCopyTextModule =
{
	success : processCopyText,
	failure : responseFailure,
	argument: { processType:"copytext" },
	timeout: ajaxCallBackCopyTextTimeOut
};

var callbackSize =
{
	success : processSizes,
	failure : responseFailure,
	argument: { processType:"size" },
	timeout: ajaxCallBackSizeTimeOut
};



var calbackEnsemblePrices =
{
	success : processEnsemblePrices,
	failure : responseFailure,
	argument: { processType:"ensemblePrices" },
	timeout: ajaxCallBackEnsemblePricesTimeOut
};

function updateItemCount(){
	queryStr = getBaseURL() + "/ajax/get_itemcount.jsp";
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackItemCount);
}
// if they went back to a page we need to make sure the item in cart count is current
YAHOO.util.Event.onDOMReady(updateItemCount);

var sizes = null;
var colors = null;

function getColors(col, siz, currentlySelectedColorId) {
	var size_id = "";
	if (siz != undefined)
		size_id = siz;
	var eobFlag = getValueFromElement('eob');
	var dept = '';
	var effort = '';
	var item = '';
	var pageType = '';
	var webEnsembleId = '';
	colorsLoaded = false;
    if (currentlySelectedColorId == undefined) {
        currentlySelectedColorId = "-1";
    }

    var clearanceFlag = getValueFromElement('clearanceCategory');
	if (eobFlag == 'true') {
		ensembleId = getValueFromElement('ensembleId');
		dept = getValueFromElement('dept');
		effort = getValueFromElement('effort');
		item = getValueFromElement('item');
		pageType = getValueFromElement('pageType');
		if (pageType == 'MATCHMATCH') {
			webEnsembleId = getValueFromElement('webEnsembleId');
		}
	}

	if (size_id.length == 0)
		if (eobFlag == "true")
			queryStr = getBaseURL() + "/ajax/get_colors.jsp?ensemble_id=" + ensembleId + "&product_id=" + getProductId() + "&selectedColorId=" + currentlySelectedColorId;
		else
			queryStr = getBaseURL() + "/ajax/get_colors.jsp?ensemble_id=" + shownEnsembleId + "&product_id=" + getProductId() + "&selectedColorId=" + currentlySelectedColorId;
	else
		if (eobFlag == "true")
			queryStr = getBaseURL() + "/ajax/get_colors.jsp?ensemble_id=" + ensembleId + "&product_id=" + getProductId() + "&size_id=" + size_id + "&selectedColorId=" + currentlySelectedColorId;
		else
			queryStr = getBaseURL() + "/ajax/get_colors.jsp?ensemble_id=" + shownEnsembleId + "&product_id=" + getProductId() + "&size_id=" + size_id + "&selectedColorId=" + currentlySelectedColorId;

	if (eobFlag == 'true') {
		queryStr = queryStr + '&eob=true' + '&dept=' + dept + '&effort=' + effort + '&item=' + item + '&pageType=' + pageType;

		if (pageType == 'MATCHMATCH')
			queryStr = queryStr + '&web_ensemble_id=' + webEnsembleId;
	}

	if (clearanceFlag)
		queryStr = queryStr + "&clearanceFlag=" + clearanceFlag;

	this.colors = col;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackColor);
}

function getColorSizes(col, currentlySelectedColorSizeId) {
	colorsLoaded = false;
    if (currentlySelectedColorSizeId == undefined) {
        currentlySelectedColorSizeId = "-1";
    }
    var clearanceFlag = getValueFromElement('clearanceCategory');
    queryStr = getBaseURL() + "/ajax/get_colors_sizes.jsp?ensemble_id=" + shownEnsembleId + "&product_id=" + getProductId() + "&selectedColorSizeId=" + currentlySelectedColorSizeId;

	if (clearanceFlag)
		queryStr = queryStr + "&clearanceFlag=" + clearanceFlag;

    this.colorsizes = col;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackColorSize);
}

var queryStr = null;

function getSizes(siz, col) {
	var color_id = "";
	if (col != undefined)
		color_id = col;

	var eobFlag = getValueFromElement('eob');
	var dept = '';
	var effort = '';
	var item = '';
	var pageType = '';
	//var clearanceFlag = getValueFromElement('displayClearaceVariants');
	var clearanceFlag = getValueFromElement('clearanceCategory');

	if (eobFlag == 'true') {
		ensembleId = getValueFromElement('ensembleId');
		dept = getValueFromElement('dept');
		effort = getValueFromElement('effort');
		item = getValueFromElement('item');
		pageType = getValueFromElement('pageType');
	}

	if (color_id.length == 0)
		if (eobFlag == "true")
			queryStr = getBaseURL() + "/ajax/get_sizes.jsp?ensemble_id=" + ensembleId + "&product_id=" + getProductId();
		else
			queryStr = getBaseURL() + "/ajax/get_sizes.jsp?ensemble_id=" + shownEnsembleId + "&product_id=" + getProductId();
	else
		if (eobFlag == "true")
			queryStr = getBaseURL() + "/ajax/get_sizes.jsp?ensemble_id=" + ensembleId + "&product_id=" + getProductId() + "&color_id=" + color_id;
		else
			queryStr = getBaseURL() + "/ajax/get_sizes.jsp?ensemble_id=" + shownEnsembleId + "&product_id=" + getProductId() + "&color_id=" + color_id;

	if (eobFlag == 'true')
		queryStr = queryStr + '&eob=true' + '&dept=' + dept + '&effort=' + effort + '&item=' + item + '&pageType=' + pageType;

	if (clearanceFlag)
		queryStr = queryStr + "&clearanceFlag=" + clearanceFlag;

	this.sizes = siz;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackSize);
}

function getOutFitTabs(of) {

	this.outfit = of;
	var clearanceFlag = getValueFromElement('displayClearaceVariants');
	//The set should always be corresponding to the parent ensembleId
	queryStr = getBaseURL() + "/ajax/get_outfit.jsp?ensemble_id=" + parentEnsembleId;

	if (clearanceFlag)
		queryStr = queryStr + "&clearanceFlag=" + clearanceFlag;

	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackOutFitModule);
}


function getCopyText(ct) {
	this.copytext = ct;

	if (parentEnsembleId == "" || parentEnsembleId == -1) {
		parentEnsembleId = ensembleId;
	}

	//eob
	var eobFlag = getValueFromElement('eob');
	var pageType = getValueFromElement('pageType');
    if ((eobFlag == "true") && (pageType == "MATCHMATCH")) {
		ensembleId = getValueFromElement('webEnsembleId');
	}
	if (eobFlag == "true")
		queryStr = getBaseURL() + "/ajax/get_ensemble_copy_text.jsp?ensemble_id=" + ensembleId;
	else
		queryStr = getBaseURL() + "/ajax/get_ensemble_copy_text.jsp?ensemble_id=" + shownEnsembleId;

	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackCopyTextModule);
}

// To retrieve the outfits for a given set
function getOutFits(setId) {

    currentOutFitSelected = setId;

    var clearanceFlag = getValueFromElement('displayClearaceVariants');
    queryStr = getBaseURL() + "/ajax/get_outfit.jsp?set_id=" + setId + "&ensemble_id=" + parentEnsembleId;
    if (clearanceFlag)
        queryStr = queryStr + "&clearanceFlag=" + clearanceFlag;

    queryStr = queryStr + "&defaultColorId=" + YAHOO.ebauer.productUtils.productImageShownColorId;
    var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackOutFit);
}


function getRelatedOutFits(ensembleId) {
    var cachedRelatedEnsembles;
	if (parentEnsembleId == -1)
		parentEnsembleId = ensembleId;

    var clearanceFlag = getValueFromElement('displayClearaceVariants');
    queryStr = getBaseURL() + "/ajax/get_related_ensembles.jsp?ensemble_id=" + parentEnsembleId;
    if (clearanceFlag)
        queryStr = queryStr + "&clearanceFlag=" + clearanceFlag;
    queryStr = queryStr + "&defaultColorId=" + YAHOO.ebauer.productUtils.productImageShownColorId;
    var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackRelatedOutFit);

}

function validateSku(deptFld, effortFld, itemFld, sourceFld) {
	var dept = getValueFromElement(deptFld);
	var effort = getValueFromElement(effortFld);
	var item = getValueFromElement(itemFld);
	var source = getValueFromElement(sourceFld);
	callSku(dept,effort,item,source);
}

function callSku(dept,effort,item,source) {
	queryStr = getBaseURL() + "/ajax/validate_sku.jsp?dept=" + dept + "&effort=" + effort + "&item=" + item + "&source=" + source;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackValidateSku);
}

function validateSkuFormatClient(dept, effort, item) {
	// validate format on the client side before passing to ajax
	var formatErrorsKey = "";

	if (dept.length == 3) {
		var dept1 = dept.slice(0, 1);
		var dept23 = dept.slice(1, 3);
		if (!isAlpha(dept1) || !isNumeric(dept23))
			formatErrorsKey += "d|";
	}
	else {
		formatErrorsKey += "d|";
	}

	if (effort.length != 3 || !isNumeric(effort)) {
		formatErrorsKey += "e|";
	}

	if (item.length != 4 || !isNumeric(item)) {
		formatErrorsKey += "i";
	}

	return formatErrorsKey;
}

function validateSkuFormat(deptFld, effortFld, itemFld, source) {
	var dept = getValueFromElement(deptFld);
	var effort = getValueFromElement(effortFld);
	var item = getValueFromElement(itemFld);
	var formatErrorsKey = validateSkuFormatClient(dept, effort, item);
	sendEOBToPage(dept, effort, item, formatErrorsKey, source);
}

function sendEOBToPage(dept, effort, item, formatErrorsKey, source){
	if (formatErrorsKey != "") {
		// we have format errors, so pass them to the eob page
		document.location.href = getBaseURL() + '/catalog/catalog_quick_order.jsp?dept=' + dept + "&effort=" + effort + "&item=" + item + "&fmt=1&vld=0&key=" + formatErrorsKey;
	} else if (YAHOO.ebauer.productUtils.productPageMode) {
		document.location.href = getBaseURL() + '/catalog/catalog_quick_order.jsp?lookupOnLoad=true&dept=' + dept + "&effort=" + effort + "&item=" + item;
	} else {
		var pgcDepartment = getPlasticGiftCardDepartment();
		var pgcItem = getPlasticGiftCardItem();

		if (dept.indexOf(pgcDepartment) > 0 && pgcItem == item) {
			document.location.href = getBaseURL() + '/custserv/gift_card.jsp?sectionId=304';
		} else {
			queryStr = getBaseURL() + "/ajax/validate_sku.jsp?dept=" + dept + "&effort=" + effort + "&item=" + item;
			if (source)
				queryStr = queryStr + "&source=" + source;
			var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackValidateSku);
		}
	}
}

function validateSkuFormatCheck(deptFld, effortFld, itemFld, source, path) {
	var dept = getValueFromElement(deptFld);
	var effort = getValueFromElement(effortFld);
	var item = getValueFromElement(itemFld);
	var formatErrorsKey = validateSkuFormatClient(dept, effort, item);

	if (formatErrorsKey != "") {
		// we have format errors, so pass them to the eob page
		path += "?env=unsecure&dest=CatalogOrder&url=/catalog/catalog_quick_order.jsp&dept=" + dept + "&effort=" + effort + "&item=" + item + "&fmt=1&vld=0&key=" + formatErrorsKey;
	} else {
		path += "?env=unsecure&dest=CatalogOrder&url=/catalog/catalog_quick_order.jsp&lookupOnLoad=true&dept=" + dept + "&effort=" + effort + "&item=" + item;
	}
	document.quickOrderFooterForm.action = path;
	document.quickOrderFooterForm.submit();
}




function createItemForm() {
	YAHOO.util.Event.onAvailable("itemform", initializeItemFormToSubmit);
}

function initializeItemFormToSubmit(isEOBProduct, isWishListItem) {
	if (document.itemform != undefined) {
		document.itemform.giftboxenabledflag.value = giftboxEnabledFlag;
		document.itemform.mgmenabledflag.value = mgmEnabledFlag;
		document.itemform.editProductModeType.value = YAHOO.ebauer.productUtils.editProductModeType;

		if (YAHOO.ebauer.productUtils.isGiftBoxSelected) {
			document.itemform.giftboxflag.value = 'Y';
			document.itemform.giftboxfrom.value = giftBoxFrom;
			document.itemform.giftboxto.value = giftBoxTo;
			document.itemform.giftboxmsg.value = giftBoxMsg;
		}
		else
			document.itemform.giftboxflag.value = 'N';

		if (YAHOO.ebauer.productUtils.isMonogramSelected)
			document.itemform.mgmflag.value = 'Y';
		else
			document.itemform.mgmflag.value = 'N';

		document.itemform.mgmstyle.value = monogramStyle;
		document.itemform.mgmcolor.value = monogramTextColor;
		document.itemform.mgmfont.value = monogramTextStyle;
		document.itemform.mgmtext.value = monogramText;
		document.itemform.mgminitial1.value = monogram_initial_1;
		document.itemform.mgminitial2.value = monogram_initial_2;
		document.itemform.mgminitial3.value = monogram_initial_3;
		document.itemform.mgminstruction.value = monogram_instructions;

		if (isWishListItem == true) {
			document.itemform.edituseritemid.value = editedItemUserItemId;
		} else {
			document.itemform.edituuid.value = editedItemUUID;
		}
		document.itemform.mode.value = mode;
		document.itemform.productid.value = productId;
		document.itemform.colorid.value = colorIdSelected;
		document.itemform.sizeid.value = sizeIdSelected;
		document.itemform.qty.value = quantitySelected;
		document.itemform.categoryId.value = gCategoryId;
		document.itemform.pathInfo.value = gPathInfo;
		document.itemform.catPath.value = gCatPath;
		document.itemform.cs.value = gCs;
        document.itemform.productVariantId.value = gProductVariantId;
		document.itemform.productVariantType.value = gProductVariantType;
		document.itemform.cmReferrer.value = gcmReferrer;
		document.itemform.clearanceFlag.value = gclearanceFlag;
        if (document.itemform.primaryCategoryName) {
            document.itemform.primaryCategoryName.value = primaryCategoryName;
        }

		if (isEOBProduct) {
			document.itemform.webEnsembleId.value = webEnsembleId;
			document.itemform.itemType.value = itemType;
			document.itemform.pageType.value = pageType;
			document.itemform.dept.value = dept;
			document.itemform.effort.value = effort;
            document.itemform.firstEffort.value = firstEffort;
            document.itemform.item.value = item;
			document.itemform.deptIndex.value = deptIndex;
			document.itemform.eobFlag.value = eobFlag;
			document.itemform.SkuEobCatalogOnly.value = skuEobCatalogOnly;
		}

		document.itemform.ensid.value = ensembleId;
		document.itemform.ensname.value = ensembleName;
		document.itemform.style.value = productStyleName;
		document.itemform.inseamFlag.value = inseamFlag;
		document.itemform.hemStyle.value = hemStyle;
		document.itemform.inseamLength.value = inseamLength;
		document.itemform.pathInfo.value = gPathInfo;
		document.itemform.showSizes.value = showSizes;
        document.itemform.siteCss.value = siteCss;
          submitAddItemForm(document.itemform, isEOBProduct, isWishListItem);
	}
}

function submitAddItemForm(itemForm, isEOBProduct, isWishListItem) {
	var callbackFunction = callbackAddItemToCart;
	var queryString = getBaseURL();
	if (isWishListItem === true) {		
		queryString = queryString + '/ajax/addItemToWishList.jsp';
		callbackFunction = callbackAddItemToWishList;
	} else {
		queryString = queryString + '/ajax/addItemToCart.jsp';
		callbackFunction = callbackAddItemToCart;
	}
	if (isEOBProduct)
		queryString += "?itemType=" + itemType + "&pageType=" + pageType;
	YAHOO.util.Connect.setForm(itemForm);
	var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', queryString, callbackFunction);
}

var processAddItemToCart = function(o) {
	var queryString = getBaseURL() + '/ajax/item_added_to_cart.jsp';
    var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', queryString, callbackAddedItemToCart);
};




var processAddItemToWishList = function(o) {
	var res = eval('('+o.responseText+')');
	YAHOO.ebauer.loginUtils.lastWishListUserItemIdAdded = res.lastWishListItemUserId;
	YAHOO.ebauer.loginUtils.checkLoginLevel(true,'/user/wishlist.jsp?plFlag=true');
}

var showItemAddedToWishList = function() {
	var queryString = getBaseURL() + '/ajax/item_added_to_wishlist.jsp?lastUserItemId='+YAHOO.ebauer.loginUtils.lastWishListUserItemIdAdded;
	if (YAHOO.ebauer.productUtils.ggpCategoryId != null)
		queryString += (queryString.indexOf("?") > 0 ? "&" : "?") + "ggpCategoryId=" + YAHOO.ebauer.productUtils.ggpCategoryId;
	if (YAHOO.ebauer.productUtils.gpCategoryId != null)
		queryString += (queryString.indexOf("?") > 0 ? "&" : "?") + "gpCategoryId=" + YAHOO.ebauer.productUtils.gpCategoryId;
	if (YAHOO.ebauer.productUtils.pCategoryId != null)
		queryString += (queryString.indexOf("?") > 0 ? "&" : "?") + "pCategoryId=" + YAHOO.ebauer.productUtils.pCategoryId;

	// Reset the wishlist user Item id that was added just now.
	YAHOO.ebauer.loginUtils.lastWishListUserItemIdAdded = -1;

	var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', queryString, callbackAddedItemToWishList);
};


var processRemoveItemToCart = function(o) {
	var bag = eval('(' + o.responseText + ')');
	YAHOO.ebauer.layerbox.transition('removed', bag);
};

var processAddedItemToCart = function(o) {
    var bag = eval('(' + o.responseText + ')');
    var item = bag.orders[0].items[0];
	if (item != undefined) {
		var itemPrice = "";
		if (item.currentPrice != undefined)
			itemPrice = item.currentPrice;
		else
			itemPrice = item.totalPrice;
		if(itemPrice != undefined)
			itemPrice = itemPrice.substring(1,itemPrice.length);

        var departCode = item.department;
        if(departCode.length == 1){
            departCode =  "0" +  item.department;
        }
        //Changes for BUG 1039
        var tempURL = GetCookie("REFERRAL_URL");

        if(tempURL == '' || tempURL == null){
             tempURL =  GetCookie('PREVIOUS');
        }     
        if(item.itemType == 'EOB'){// && GetCookie("EOB_Search")=='Yes'
            productId = item.departmentprefix  +  departCode + ' ' + item.effortcode + ' ' + item.itemNbr;
            cmCreateShopAction5Tag(productId, item.name, item.itemQuantity, itemPrice, "T50", departCode, tempURL);
        } else {
            cmCreateShopAction5Tag(item.ensembleId, item.name, item.itemQuantity, itemPrice, gPathInfo, departCode, tempURL);
        }
        cmDisplayShop5s();
        cmCreatePageviewTag( '/js/eb/item_added_to_cart.js (Interstitial Page)', 'C27410C27411' );
		SetCookie('REFERRAL_URL', escape(document.location.href));
		setSOACookie(bag.orders[0].items.length);
        //dotomi tag
        primaryCategoryName = item.dtm_categoryId;
        if(item.itemType == 'EOB') {
            thisProdId = item.webEnsembleId;
            if(item.webEnsembleId == -1){
                thisProdId = item.ensembleId;
            }
            if(thisProdId != -1){
                createDTMAbandonPageTag(item.dtm_promo, item.dtm_user, item.dtm_categoryId, '', thisProdId);
            }
        }else {
            createDTMAbandonPageTag(item.dtm_promo, item.dtm_user, item.dtm_categoryId, '', item.ensembleId);
        }

	}
	if (YAHOO.ebauer.productUtils.editProductMode) {
		YAHOO.ebauer.productUtils.editProductMode = false;
		//reset the flag
		if (YAHOO.ebauer.bagUtils) {
			//YAHOO.ebauer.layerbox.hideLayer();
			fb.end();
			gotoCheckOutPage();
			//editing from bag
		} else {
			//editing from interstitial
			var modal = createShoppingBag(bag, item.siteCss);
			$("layerbox").appendChild(modal);
			fb.end();
      }
	} else {
		fb.end();
		var modal = createShoppingBag(bag, item.siteCss);
		$("layerbox").appendChild(modal);
		

		if(buyAnotherItemFlag) {
			fb.end();
			gotoCheckOutPage();
		}
   }
	YAHOO.util.Dom.setStyle("layerbox","background-color","transparent");
};


var processAddedItemToWishList = function(o) {
    var bag = eval('(' + o.responseText + ')');
    var item = bag.orders[0].items[0];
	if (item != undefined) {
		var itemPrice = "";
		if (item.currentPrice != undefined)
			itemPrice = item.currentPrice;
		else
			itemPrice = item.totalPrice;
		if(itemPrice != undefined)
			itemPrice = itemPrice.substring(1,itemPrice.length);

        var departCode = item.department;
        if(departCode.length == 1){
            departCode =  "0" +  item.department;
        }
        //Changes for BUG 1039
        var tempURL = GetCookie("REFERRAL_URL");

        if(tempURL == '' || tempURL == null){
             tempURL =  GetCookie('PREVIOUS');
        }

        if(item.itemType == 'EOB'){// && GetCookie("EOB_Search")=='Yes'
            productId = item.departmentprefix  +  departCode + ' ' + item.effortcode + ' ' + item.itemNbr;
            //cmCreateShopAction5Tag(productId, item.name, item.itemQuantity, itemPrice, "T50",departCode, tempURL);// We do not want Shop Action Tag for Items added to WishList
        } else {
            //cmCreateShopAction5Tag(item.ensembleId, item.name, item.itemQuantity, itemPrice, gPathInfo, departCode, tempURL); // We do not want Shop Action Tag for Items added to WishList
        }
        //cmDisplayShop5s(); // We do not want Shop Action Tag for Items added to WishList
		SetCookie('REFERRAL_URL', escape(document.location.href));
		setSOACookie(bag.orders[0].items.length);
	}
	if (YAHOO.ebauer.productUtils.editProductMode) {
		YAHOO.ebauer.productUtils.editProductMode = false;
		//reset the flag
		if (YAHOO.ebauer.bagUtils) {
			YAHOO.ebauer.layerbox.hideLayer();
			gotoCheckOutPage();
			//editing from bag
		} else if (isEditedItemFromWishList == true) {			
			YAHOO.ebauer.layerbox.hideLayer();
			gotoWishListPage();
		} else {
			//editing from interstitial
			var modal = createShoppingBagForWishList(bag);
			$("layerbox").appendChild(modal);
      }
	} else {
		var modal = createShoppingBagForWishList(bag);
		$("layerbox").appendChild(modal);
   }
	YAHOO.util.Dom.setStyle("layerbox","background-color","transparent");
};

var callbackAddItemToCart =
{
	success : processAddItemToCart,
	failure : responseFailure,
	argument: { processType:"additemtocart" },
	timeout: ajaxCallBackAddItemToCartTimeOut
};

var callbackAddItemToWishList =
{
	success : processAddItemToWishList,
	failure : responseFailure,
	argument: { processType:"additemtowishlist" },
	timeout: ajaxCallBackAddItemToCartTimeOut
};


var callbackRemoveItemFromCart =
{
	success : processRemoveItemToCart,
	failure : responseFailure,
	argument: { processType:"removeitemfromcart" },
	timeout: ajaxCallBackRemoveItemFromCartTimeOut
};

var callbackAddedItemToCart =
{
	success : processAddedItemToCart,
	failure : responseFailure,
	argument: { processType:"addeditemtocart" },
	timeout: ajaxCallBackAddedItemToCartTimeOut
};

var callbackAddedItemToWishList =
{
	success : processAddedItemToWishList,
	failure : responseFailure,
	argument: { processType:"addeditemtowishlist" },
	timeout: ajaxCallBackAddedItemToCartTimeOut
};

function doNothing() { }

var callbackRemoveLastWishListItemForLevel1 =
{
	success : doNothing,
	failure : doNothing,
	argument: { processType:"cancelLogin" },
	timeout: ajaxCallBackGiftBoxTimeOut
};


function removeWishListItemForLoginLevel1(userItemId) {
    var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', getBaseURL() + '/ajax/removeLastWishListItemAddedForNotLoggedInUser.jsp?userItemId='+userItemId+'&loginLevel=1' , callbackRemoveLastWishListItemForLevel1);
}


var validationError = false;
function saveGiftBox(giftBoxForm, editGiftBoxMode) {
	// unless editGiftBoxMode is set to true, it is assumed we are adding a new giftbox
	validationError = false;
	giftBoxFrom = giftBoxForm.giftboxfrom.value;
	giftBoxTo = giftBoxForm.giftboxto.value;
	validate('\'To\'', giftBoxTo, 'giftboxto');
	giftBoxMsg = giftBoxForm.giftboxmsg.value;

	if (validationError) {
		return;
	} else {
		if (YAHOO.ebauer.productUtils.editProductMode && YAHOO.ebauer.productUtils.editProductModeType == "GB") {
			YAHOO.util.Connect.setForm(giftBoxForm.name);
			var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', getBaseURL() + '/ajax/save_giftbox.jsp?uuid=' + YAHOO.ebauer.productUtils.passedItemUUID , callbackGiftBox);
		}
		else {
			//createItemForm();
            if (isKioskMode() == 'true') {

                YAHOO.ebauer.layerbox.transition('addedFromKiosk');
            } else {
                YAHOO.ebauer.layerbox.transition('added');
            }
		}
	}
}

// Method signature : validate(name,valueToBeValidated,id)
function validate(name, value, id) {
    if (value.length > 0) {
		// Remove all white spaces in the value
		while (value.substring(0, 1) == ' ') {
			value = value.substring(1, value.length);
		}
	}
	var valObj = $('err_' + id);
	if (value.length == 0) {
		if (valObj != undefined) {
			valObj.className = 'errorShow';
			valObj.innerHTML = '<span class="error">Please enter ' + name + '</span>';
			validationError = true;
			return;
		}
	}
	if (valObj != undefined) {
		valObj.className = 'errorHide';
	}
}

// helper method to just run a validation and set the validationError field
function validateField(name, value, id) {
	if (value.length > 0) {
		// Remove all white spaces in the value
		while (value.substring(0, 1) == ' ') {
			value = value.substring(1, value.length);
		}
	}
	if (value.length == 0)
		validationError = true;
	return;
}

function validateGiftBoxFields(giftBoxForm) {
	validationError = false;
	giftBoxTo = giftBoxForm.giftboxto.value;
	validateField('\'To\'', giftBoxTo, 'giftboxto');
	if (validationError) {
		YAHOO.util.Dom.replaceClass('submitGiftBox', 'buttonActive', 'buttonInactive');
		return false;
	}
	YAHOO.util.Dom.replaceClass('submitGiftBox', 'buttonInactive', 'buttonActive');
	return true;
}

function validateLoginEmailAddress() {
   var emailField = $("accessAccount_email");
   if (emailField != undefined) {
      var validEmail = validateEmailAddress(emailField.value);
      if (validEmail == false) {
          if ( $("emailErrorDiv") != undefined ) {
            if (emailField.value != '') {
               $("emailErrorDiv").innerHTML="Invalid email address. Please try again.";
            }
          }
      } else {
          if ( $("emailErrorDiv") != undefined ) {
               $("emailErrorDiv").innerHTML="";
          }
      }
   }
}

function validateLoginEmailAndPassword() {
   var emailField = $("accessAccount_email");
   var pwdField = $("accessAccount_pword");
   validateLoginFields(emailField, pwdField, false);
}

function validateLoginFields(emailField, pwdField, submitFlag) {
    var errorsFound = false;
    var emailAddress = emailField.value;
    var pwd = pwdField.value;
    var validEmail = validateEmailAddress(emailAddress);
    var validateFlag =  ( validEmail == true && pwd != '');
    if (validateFlag == false) {
            if ($("emailErrorDiv") != null) {
                if (emailAddress == '') {
                    if (submitFlag == true) {
                        $("emailErrorDiv").innerHTML="Please enter your email address.";
                    }
                } else if (validEmail == false) {
                      $("emailErrorDiv").innerHTML="Invalid email address. Please try again.";
                } else {
                    $("emailErrorDiv").innerHTML="";
                }
            }

            if ($("passwordErrorDiv") != null) {
                if (pwd == '') {
                    if (submitFlag == true) {
                        $("passwordErrorDiv").innerHTML="Please enter your password.";
                    }
                } else {
                    $("passwordErrorDiv").innerHTML="";
                }
            }
        YAHOO.util.Dom.replaceClass('submitLogin', 'buttonActive', 'buttonInactive');
        return false;
    } else {
        YAHOO.util.Dom.replaceClass('submitLogin', 'buttonInactive', 'buttonActive');
    }
    return true;

}

function validateLoginForm(loginForm, submitFlag) {
   return validateLoginFields(loginForm.accessAccount_email, loginForm.accessAccount_pword, submitFlag);
}

function submitLogin(loginForm) {
	loginForm.submit();
}

var processGiftBox = function(o) {
	YAHOO.ebauer.productUtils.giftBoxCompleted = true;
	YAHOO.ebauer.productUtils.performEdits(false);
};

var callbackGiftBox =
{
	success : processGiftBox,
	failure : responseFailure,
	argument: { processType:"giftbox" },
	timeout: ajaxCallBackGiftBoxTimeOut
};


var layerPageFlag = false;
// layerPageFlag tells that this removal call is coming from Layer , or the
// View Shopping CART/Checkout PAGE - so that the response will go back to LAYER
// or the refreshing of the checkout page
function removeItemFromCart(uuid, isLayerPage, isWishListItem) {
	layerPageFlag = isLayerPage;
	var key = 'uuid=';
	if (isWishListItem == true) {
		key = 'useritemid=';
	}
	if (layerPageFlag == true) {
		var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/removeItemFromCart.jsp?' + key +  uuid, callbackRemoveItemFromCart);
	} else {
		var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/removeItemFromCart.jsp?' + key + uuid, callbackshowcheckoutpage);
	}
}

function removeAllItemsFromcart() {
	var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/removeAllItemsFromCart.jsp', callbackshowcheckoutpage);
}

function updateTabs() {
	jQuery.fn.ProductModule();
}

function openMoreInfo(passedIdObj) {	
	var pplURL = rewirteUrl('/ajax/more_info.jsp?ensembleId='+passedIdObj);
	var pplType = 'ajax';
	var pplParams = 'autoFitHTML:true width:500 height:740 scrolling:no padding:0 panelPadding:20 outerClose:true controlsPos:tr';
	var pplCallBacks = '';		
		openPPL(pplURL, pplType, pplParams, pplCallBacks);
}

function getProductDetails(ensembleId) {
	var timestamp = Math.round((new Date()).getTime() / 1000);
	var pplURL = rewirteUrl('/catalog/product.jsp?standalone=N&ensembleId=' + ensembleId + '&ts=' + timestamp);
	var pplType = 'ajax';
	var pplParams = 'autoFitHTML:true height:600 width:968 scrolling:no padding:0 padding:20 outerClose:true controlsPos:tr';
	var pplCallBacks = '';	  
	if (ensembleId != "") {
		openPPL(pplURL, pplType, pplParams, pplCallBacks);		
	}
}

var processShowCheckoutPage = function(o)
{
	gotoCheckOutPage();
};

var callbackshowcheckoutpage =
{
	success : processShowCheckoutPage,
	failure : responseFailure,
	argument: { processType:"showcheckoutpage" },
	timeout: ajaxCallBackShowCheckoutPageTimeOut
};



var editedItemUUID = null;
var editedItemUserItemId = null;
var calledFromLayerPage = false;
var submitSaveBtnClicked = false;
var isEditedItemFromWishList = false;
function editItemInCart(uuid, isLayerPage, categoryId, imageName, imageTypeCode, isWishListItem) {
   isEditedItemFromWishList = isWishListItem;
	var keyValue = '';
	if (isWishListItem == true) {
		editedItemUserItemId = uuid;
		keyValue = 'useritemid='+uuid;
	} else {
		editedItemUUID = uuid;
		keyValue = 'uuid='+uuid;
	}
	 YAHOO.ebauer.productUtils.resetFlags();
	if (categoryId != null) {
		gCategoryId = categoryId;
	}
	calledFromLayerPage = isLayerPage;
	
    var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/loadItemDetailsForEdit.jsp?'+keyValue+ '&imageName=' + imageName + '&imageTypeCode=' + imageTypeCode, callbackLoadItemForEdit);
	productInfo = cObj;	
}

var showSelectedValuesForEdit = false;
var itemForEditValues = null;
var processLoadItemForEdit = function(o) {
	var x = eval('(' + o.responseText + ')');
	queryString = '';
	updateCount = 0;
	showSelectedValuesForEdit = true;
	itemForEditValues = x;
	ensembleId = x.item.ensid;
	parentEnsembleId = ensembleId;
	productId = x.item.productid;
    pathInfo = x.item.pathInfo;
    mode = 'edit';
    YAHOO.ebauer.productUtils.editProductMode = true;
	YAHOO.ebauer.productUtils.editProductModeType = "item";

	if (x.item.colorid != undefined) {
		colorId = x.item.colorid;
	}

   //changes for bug 0963
   if(x.item.defaultImageUrl != undefined && x.item.defaultImageUrl != ''){
      var startIndex = x.item.defaultImageUrl.lastIndexOf("/");
      var endIndex = x.item.defaultImageUrl.indexOf("?");
      if(startIndex != -1 && endIndex != -1){
         imageName = x.item.defaultImageUrl.substring(startIndex + 1, endIndex);
         var colorIndex = imageName.lastIndexOf("_");
         if(colorIndex != -1) {
            imageTypeCode = imageName.substring(colorIndex+ 4, colorIndex+5);
         }
      }

   }

   if (x.item.clearanceFlag)
		gCs = "1";

	if (YAHOO.ebauer.productUtils.productPageMode) {
		var layerboxState = YAHOO.ebauer.layerbox.getLayerboxState();

		// clicks from the added interstitial, on top of the standalone product page
		if (layerboxState != "")
			YAHOO.ebauer.layerbox.hideLayer();
	}
	
	var categoryName = "Previous Page";
    if (YAHOO.ebauer.bagUtils) {
        categoryName = "Shopping Bag";
    } else if (isEditedItemFromWishList == true) {
        categoryName = "Wish List";
    } else if (gBackToCat != undefined && gBackToCat != '') {
        categoryName = gBackToCat;
    }
    
   var wishlistItem = "n";
	
	if (isEditedItemFromWishList) {
		wishlistItem = 'y';
	} else {
		wishlistItem = 'n';
	}
	if (x.item.itemType == "EOB" || x.item.originalItemType == "EOB") {
		queryString += 'dept=' + x.item.departmentprefix + x.item.department + '&effort=' + x.item.effortcode + '&item=' + x.item.itemNbr + '&eobSource=' + (eobSource != '' ? eobSource : 'Shopping Bag');

        if(eobSource != ''){
            x.item.source = eobSource;
        }

        if (x.item.colorid != null && x.item.sizeid != null) {
			queryString += '&selectedColorId=' + x.item.colorid + '&selectedSizeId=' + x.item.sizeid;
		}

        //if (YAHOO.ebauer.productUtils.productPageMode)
		//	YAHOO.ebauer.transitions.swapHtml(YAHOO.ebauer.layerbox.getConfigObject('eobproduct'), {divOverride:'dossier_wrapper'});
		//else
		// YAHOO.ebauer.layerbox.transition('eobproduct', x.item);       	
	    var pplURL = rewirteUrl('/catalog/eob_product.jsp?standalone=N&wishlistItem='+wishlistItem+'&uuid='+editedItemUUID+'&editFromPage='+categoryName+'&'+queryString);
		var pplType = 'ajax';
		var pplParams = 'height:600 width:968 autoFitHTML:true scrolling:no padding:0 panelPadding:20 outerClose:true controlsPos:tr';
		var pplCallBacks = '';		
		openPPL(pplURL, pplType, pplParams, pplCallBacks);
	} else {
        
        queryString += 'categoryName=' + categoryName;

		if (x.item.categoryid != "")
			queryString += "&categoryId=" + x.item.categoryid;

		if (gCs != "" && gCs != null){

            queryString += "&cs=" + gCs;
            //BUG00248.
            queryString += '&selectedColorId=' + x.item.colorid + '&selectedSizeId=' + x.item.sizeid;

            colorIdSelected = x.item.colorid;
	        sizeIdSelected = x.item.sizeid;
        }
		//if (YAHOO.ebauer.productUtils.productPageMode)
		//	YAHOO.ebauer.transitions.swapHtml(YAHOO.ebauer.layerbox.getConfigObject('product'), {ensembleId:ensembleId,divOverride:'dossier_wrapper'});
		//else
		//	YAHOO.ebauer.layerbox.transition('product', {'ensembleId':ensembleId});
		var pplURL = rewirteUrl('/catalog/product.jsp?standalone=N&wishlistItem=' + wishlistItem + '&uuid=' + editedItemUUID + '&editFromPage=' + categoryName + '&ensembleId=' + ensembleId + '&' + queryString);
		var pplType = 'ajax';
		var pplParams = 'autoFitHTML:true width:968 height:580 scrolling:no padding:0 panelPadding:20 outerClose:true controlsPos:tr';
		var pplCallBacks = '';		
		openPPL(pplURL, pplType, pplParams, pplCallBacks);
		
	}

	if (x.item.giftboxflag == "Y") {
		YAHOO.ebauer.productUtils.isGiftBoxSelected = true;
		queryString += '&giftbox=' + x.item.giftboxflag;
	}

	if (x.item.mgmflag == "Y") {
		YAHOO.ebauer.productUtils.isMonogramSelected = true;
		queryString += '&mgm=' + x.item.mgmflag;
	}

    //BUG00234
     if (x.item.inseamflag == "Y"){
         var hemStyleString = x.item.hemStyle;
         var inSeamLengthString = x.item.inseamLength;
         queryString += "&selectedHemStyle=" + hemStyleString + "&selectedInseamLength=" + inSeamLengthString;
     }

    //alert("productdata.js: processLoadItemForEdit().queryString= " + queryString);
}

var processLoadItemForaddonEdit = function(o)
{
	var x = eval('(' + o.responseText + ')');
	colorIdSelected = x.item.colorid;
	sizeIdSelected = x.item.sizeid;
	productId = x.item.productid;

	if (YAHOO.ebauer.productUtils.editProductModeType == "GB")
		YAHOO.ebauer.layerbox.transition('giftbox');
	else if (YAHOO.ebauer.productUtils.editProductModeType == "MGM")
		YAHOO.ebauer.layerbox.transition('monogram');
};


var callbackLoadItemForEdit =
{
	success : processLoadItemForEdit,
	failure : responseFailure,
	argument: { processType:"loaditemforedit" },
	timeout: ajaxCallBackLoadItemForEditTimeOut
};

var callbackLoadItemForaddonEdit =
{
	success : processLoadItemForaddonEdit,
	failure : responseFailure,
	argument: { processType:"loaditemforaddonedit" },
	timeout: ajaxCallBackLoadItemForAddOnEditTimeOut
};

function loadGiftToForm() {
	if (mode == 'edit') {
		$('giftboxfrom').value = giftBoxFrom;
		$('giftboxto').value = giftBoxTo;
		$('giftboxmsg').value = giftBoxMsg;
	}
}


function loadMonogramToForm() {
	if (isMonogramSelectedOLD == 'Y') {
		var aCancel = createDOM('a', {'href':'javascript:hideDrape();gotoCheckOutPage();'});
		aCancel.appendChild(document.createTextNode('Cancel and go back to Shopping Bag'));
		var ddCancel = $("cancel_monogram_go_back");
		if (ddCancel != undefined) {
			ddCancel.innerHTML = "";
			ddCancel.appendChild(aCancel);
		}
		displayMonogramTextFields(monogramStyles.selectedIndex);

        if (monogramStyle == 2) {
			$('initial_1').value = monogram_initial_1;
		} else if (monogramStyle == 3 || monogramStyle == 6) {

			$('initial_1').value = monogram_initial_1;
			$('initial_2').value = monogram_initial_2;
			$('initial_3').value = monogram_initial_3;
		} else if (monogramStyle == 11) {
			$('initial_1').value = monogram_initial_1;
			$('initial_2').value = monogram_initial_2;
		} else {
            $('lines').value = monogram_lines;
		}
		monogramIgnoredFlag = true;
		displayPreviewText();
		changeMonogramColor($("monogram_color"));
	}
}




function saveMonogram(monogramForm) {
	var textObj = $("monogramTextDiv_error");
	if (textObj != null || textObj != undefined) {
		disableDisplay(textObj);
	}

	var hasMonogramErrors;
	hasMonogramErrors = validateMonogram();

	if (hasMonogramErrors)
		return;

	monogramStyle = monogramForm.monogram_style.value;
	monogramTextColor = monogramForm.monogram_color.value;
	monogramTextStyle = monogramForm.monogram_font.value;
	monogramText = null;
	monogram_initial_1 = null;
	monogram_initial_2 = null;
	monogram_initial_3 = null;
	monogram_instructions = monogramForm.mgminstruction.value;
	//monogramForm.monogram_text.value;
	if (monogramStyle == 2) {
		monogram_initial_1 = monogramForm.initial_1.value.toUpperCase();
		if (!isValidMonogramText(monogram_initial_1)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.initialNotEntered"));
			return;
		}
		if (!containsValidChars(monogram_initial_1)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.invalidMonogram"));
			return;
		}
		monogramText = monogram_initial_1;
		monogram_initial_1 = "";
	} else if (monogramStyle == 6 || monogramStyle == 3) {
		monogram_initial_1 = monogramForm.initial_1.value.toUpperCase();
		monogram_initial_2 = monogramForm.initial_2.value.toUpperCase();
		monogram_initial_3 = monogramForm.initial_3.value.toUpperCase();
		monogramText = monogram_initial_1 + ' ' + monogram_initial_2 + ' ' + monogram_initial_3;
		if (!isValidMonogramText(monogram_initial_1) || !isValidMonogramText(monogram_initial_2) || !isValidMonogramText(monogram_initial_3)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.initialsNotEntered"));
			return;
		}
		if (!containsValidChars(monogram_initial_1) || !containsValidChars(monogram_initial_2) || !containsValidChars(monogram_initial_3)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.invalidMonogram"));
			return;
		}
	}
    /*
        else if (monogramStyle == 3 || monogramStyle == 6) {
		monogram_initial_1 = monogramForm.initial_1.value.toUpperCase();
		monogram_initial_2 = monogramForm.initial_2.value.toUpperCase();
		monogram_initial_3 = monogramForm.initial_3.value.toUpperCase();
		monogramText = monogram_initial_3;
		if (!isValidMonogramText(monogram_initial_1) || !isValidMonogramText(monogram_initial_2) || !isValidMonogramText(monogram_initial_3)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.initialsNotEntered"));
			return;
		}
		if (!containsValidChars(monogram_initial_1) || !containsValidChars(monogram_initial_2) || !containsValidChars(monogram_initial_3)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.invalidMonogram"));
			return;
		}

	}
	*/
        else if (monogramStyle == 11) {
		monogram_initial_1 = monogramForm.initial_1.value.toUpperCase();
		monogram_initial_2 = monogramForm.initial_2.value.toUpperCase();
		monogramText = monogram_initial_1 + ' ' + monogram_initial_2;
		if (!isValidMonogramText(monogram_initial_1) || !isValidMonogramText(monogram_initial_2)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.initialsNotEntered"));
			return;
		}
		if (!containsValidChars(monogram_initial_1) || !containsValidChars(monogram_initial_2)) {
			displayErrorMessage(getMonogramErrorMessage("monogram.validationError.invalidMonogram"));
			return;
		}
		monogram_initial_1 = "";
		monogram_initial_2 = "";
	} else {
		if (monogramForm.lines != null) {
			monogram_lines = monogramForm.lines.value;
			if (!isValidMonogramText(monogram_lines)) {
				displayErrorMessage(getMonogramErrorMessage("monogram.validationError.invalidMonogram"));
				return;
			}
			if (!containsValidWords(monogram_lines)) {
				displayErrorMessage(getMonogramErrorMessage("monogram.validationError.invalidMonogram"));
				return;
			}
			if (monogram_lines.length == 1) {
				monogramText = monogram_lines.toUpperCase();
			} else if (monogram_lines.length > 1) {
				monogramText = monogram_lines.substring(0, 1).toUpperCase() + monogram_lines.substring(1);
			}
		}
	}
	monogramIgnoredFlag = false;

	if (YAHOO.ebauer.productUtils.editProductMode && YAHOO.ebauer.productUtils.editProductModeType == "MGM") {
		mgmenabledflag = "Y";
		isMonogramSelectedOLD = "Y";
		var mgmFlag = (YAHOO.ebauer.productUtils.isMonogramSelected ? "Y" : "N");
		var saveMgmUrl = getBaseURL() + '/ajax/save_monogram.jsp?uuid=' + YAHOO.ebauer.productUtils.passedItemUUID + '&mgmflag=' + mgmFlag + '&mgmenabledflag=' + mgmenabledflag + '&mgmstyle=' + monogramStyle + '&mgmcolor=' + monogramTextColor + '&mgmfont=' + monogramTextStyle + '&mgmtext=' + monogramText;

		if (monogram_initial_1 != null)
			saveMgmUrl += '&mgminitial1=' + monogram_initial_1;
		if (monogram_initial_2 != null)
			saveMgmUrl += '&mgminitial2=' + monogram_initial_2;
		if (monogram_initial_3 != null)
			saveMgmUrl += '&mgminitial3=' + monogram_initial_3;

		saveMgmUrl += '&mgminstruction=' + monogram_instructions;
		var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', saveMgmUrl, callbackMonogram);
	} else {
		if (YAHOO.ebauer.productUtils.isGiftBoxSelected) {
			// if monogramming and giftbox was selected, we need to move onto giftbox
			YAHOO.ebauer.layerbox.transition('giftbox');
		} else {
            if (isKioskMode() == 'true') {

                YAHOO.ebauer.layerbox.transition('addedFromKiosk');
            } else {
                YAHOO.ebauer.layerbox.transition('added');
            }
		}
	}
}

function displayErrorMessage(errMsg) {
	var textObj = $("monogramTextDiv_error");
	if (textObj != null || textObj != undefined) {
		textObj.innerHTML = "";
		var spanVar = createDOM('span', {'class':'error'});
		spanVar.appendChild(document.createTextNode(errMsg));
		textObj.appendChild(spanVar);
		enableDisplay(textObj);
	}
}

var processMonogram = function(o) {
	YAHOO.ebauer.productUtils.monogramCompleted = true;
	YAHOO.ebauer.productUtils.performEdits(false);
};

var callbackMonogram =
{
	success : processMonogram,
	failure : responseFailure,
	argument: { processType:"monogram" },
	timeout: ajaxCallBackMonogramTimeOut
};

function continueWithoutMonogram(monogramForm) {
	monogramStyle = '';
	monogramTextColor = '';
	monogramTextStyle = '';
	monogramText = '';
	monogramIgnoredFlag = true;
	if (editedItemUUID != null) {
		var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', getBaseURL() + '/ajax/cancel_monogram.jsp?uuid=' + editedItemUUID, callbackMonogram);
	} else {
		isMonogramSelectedOLD = 'N';
		createItemForm();
	}
}

function continueWithoutGiftbox(giftBoxForm) {
	if (editedItemUUID != null) {
		var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', getBaseURL() + '/ajax/cancel_giftbox.jsp?uuid=' + editedItemUUID, callbackGiftBox);
	} else {
		isGiftBoxSelectedOLD = 'N';
		createItemForm();
	}
}



function addMonogram() {
	YAHOO.ebauer.layerbox.transition('monogram');
}

var removeMonogramArg =
{
	success : processRemoveMonogram,
	failure : responseFailure,
	argument: { processType:"removeMonogram" },
	timeout: ajaxCallBackRemoveMonogramArgTimeOut
};

var removeMonogramBypassArg =
{
	success : gotoCheckOutPage,
	failure : responseFailure,
	argument: { processType:"removeMonogram" },
	timeout: ajaxCallBackRemoveMonogramByPassArgTimeOut
};

function removeMonogram(bypassProductEdits) {
	monogramStyle = '';
	monogramTextColor = '';
	monogramTextStyle = '';
	monogramText = '';
	monogramIgnoredFlag = true;
	var args = bypassProductEdits ? removeMonogramBypassArg : removeMonogramArg;
	var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', getBaseURL() + '/ajax/cancel_monogram.jsp?uuid=' + editedItemUUID, args);
}

function processRemoveMonogram() {
	YAHOO.ebauer.productUtils.monogramCompleted = true;
	YAHOO.ebauer.productUtils.performEdits(false);
}

function addGiftbox() {
	YAHOO.ebauer.layerbox.transition('giftbox');
}

var removeGiftboxArg =
{
	success : processRemoveGiftbox,
	failure : responseFailure,
	argument: { processType:"removeGiftbox" },
	timeout: ajaxCallBackRemoveGiftBoxArgTimeOut
};


var removeGiftboxBypassArg =
{
	success : gotoCheckOutPage,
	failure : responseFailure,
	argument: { processType:"removeGiftbox" },
	timeout: ajaxCallBackRemoveGiftBoxByPassArgTimeOut
};

function removeGiftbox(bypassProductEdits) {
    var args = bypassProductEdits ? removeGiftboxBypassArg : removeGiftboxArg;
    var cObj = YAHOO.ebauer.utilities.asyncRequest('POST', getBaseURL() + '/ajax/cancel_giftbox.jsp?uuid=' + editedItemUUID, args);
}

function processRemoveGiftbox() {
	YAHOO.ebauer.productUtils.giftBoxCompleted = true;
	YAHOO.ebauer.productUtils.performEdits(false);
}



var monogramStyles = null;
var currentFontValue = -1;
function getMonogramStyles(monogramStylesField, mgmFont) {
	currentFontValue = mgmFont;

	var mgmFontIdVal = "";
	if (mgmFont != -1)
		mgmFontIdVal = mgmFont;
	if (mgmFontIdVal.length == 0 || mgmFontIdVal == -1)
		queryStr = getBaseURL() + "/ajax/get_monogram_styles.jsp?&product_id=" + productId;
	else
		queryStr = getBaseURL() + "/ajax/get_monogram_styles.jsp?&product_id=" + productId + "&mgm_font=" + mgmFontIdVal;

    if (eobFlag == 'true' || gMonogram_eobFlag == 'true') {
        if (gMonogram_eobFlag == 'true')
            queryStr += "&eob=" + gMonogram_eobFlag + "&dept=" + gMonogram_dept + "&effort=" + gMonogram_effort + "&item=" + gMonogram_itemNbr + "&pageType=" + gMonogram_pageType;
        else
            queryStr += "&eob=" + eobFlag + "&dept=" + dept + "&effort=" + effort + "&item=" + item + "&pageType=" + pageType;
    }
	monogramStyles = monogramStylesField;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackMonogramStyles);
}


//var monogramStyleIndex = 1;
var styleTexts = new Array();
var styleLineNums = new Array();
var styleCharNums = new Array();
var styleNames = new Array();
var processMonogramStyles = function(o)
{
	// clear the ARRAYS
	styleTexts = new Array();
	styleLineNums = new Array();
	styleCharNums = new Array();
	styleNames = new Array();

	var x = eval('(' + o.responseText + ')');
	var monogramStyleLength = x.monogramStyles.monogramStyle.length;

	for (var i = 0; i < monogramStyleLength; i++) {
		var selectIdx = i + 1;
		//don't overwrite the first option of the select menu

		//auto select if there's only one option
		if (monogramStyleLength == 1)
			monogramStyles.options[selectIdx] = new Option(x.monogramStyles.monogramStyle[i].name, x.monogramStyles.monogramStyle[i].id, true, true);
		else
			monogramStyles.options[selectIdx] = new Option(x.monogramStyles.monogramStyle[i].name, x.monogramStyles.monogramStyle[i].id);

		// for consistency the array element index matches the option index of the option in the select menu
		styleTexts[selectIdx] = x.monogramStyles.monogramStyle[i].styleText;
		styleLineNums[selectIdx] = x.monogramStyles.monogramStyle[i].numLines;
		styleCharNums[selectIdx] = x.monogramStyles.monogramStyle[i].numChars;
		styleNames[selectIdx] = x.monogramStyles.monogramStyle[i].name;
	}

	var monogramStyleIndex = monogramStyles.selectedIndex;
	var styleIdSelected = monogramStyles.value;

	displayMonogramTextFields(monogramStyleIndex);

	if (monogramStyleLength == 1)
		updateMonogramFonts(styleIdSelected); // load fonts if there is only 1 style option

	ajaxCompleteObject.completeEvent.fire("updateStylesMethod");

	if (YAHOO.ebauer.productUtils.editProductMode) {
		for (var i = 0; i < monogramStyles.length; i++) {
			if (monogramStyles[i].value == monogramStyle) {
				monogramStyles.selectedIndex = i;
			}
		}
	}
};

var callbackMonogramStyles =
{
	success : processMonogramStyles,
	failure : responseFailure,
	argument: { processType:"monogramstyles" },
	timeout: ajaxCallBackMonogramStylesTimeOut
};


var monogramFonts = null;
var currentStyleValue = -1;
function getMonogramFonts(monogramFontField, mgmStyle) {
	currentStyleValue = mgmStyle;
	queryStr = getBaseURL() + "/ajax/get_monogram_fonts.jsp?&product_id=" + productId;

	if (mgmStyle > 0)
		queryStr += "&mgm_style=" + mgmStyle;

    if (eobFlag == 'true' || gMonogram_eobFlag == 'true') {
        if (gMonogram_eobFlag == 'true')
            queryStr += "&eob=" + gMonogram_eobFlag + "&dept=" + gMonogram_dept + "&effort=" + gMonogram_effort + "&item=" + gMonogram_itemNbr + "&pageType=" + gMonogram_pageType;
        else
            queryStr += "&eob=" + eobFlag + "&dept=" + dept + "&effort=" + effort + "&item=" + item + "&pageType=" + pageType;
    }

	monogramFonts = monogramFontField;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackMonogramFonts);
}


var processMonogramFonts = function(o) {
	var x = eval('(' + o.responseText + ')');
	var length = x.monogramFonts.monogramFont.length;

	for (var i = 0; i < length; i++) {
		var selectIdx = i + 1;
		//don't overwrite the first option of the select menu
		//auto select if there's only one option
		if (length == 1)
			monogramFonts.options[selectIdx] = new Option(x.monogramFonts.monogramFont[i].name, x.monogramFonts.monogramFont[i].id, true, true);
		else
			monogramFonts.options[selectIdx] = new Option(x.monogramFonts.monogramFont[i].name, x.monogramFonts.monogramFont[i].id);
	}
	toggleMgmData();
	gMonogramFontFlag = true;
	ajaxCompleteObject.completeEvent.fire("updateFontsMethod");

	if (YAHOO.ebauer.productUtils.editProductMode) {
		for (var i = 0; i < monogramFonts.length; i++) {
			if (monogramFonts[i].value == monogramTextStyle) {
				monogramFonts.selectedIndex = i;
			}
		}
		loadMonogramToForm();
	}
};

var callbackMonogramFonts =
{
	success : processMonogramFonts,
	failure : responseFailure,
	argument: { processType:"monogramfonts" },
	timeout: ajaxCallBackMonogramFontsTimeOut
};


var monogramColors = null;
function getMonogramColors(monogramColorsField) {
	queryStr = getBaseURL() + "/ajax/get_monogram_colors.jsp?&product_id=" + productId;

    if (eobFlag == 'true' || gMonogram_eobFlag == 'true') {
        if (gMonogram_eobFlag == 'true')
            queryStr += "&eob=" + gMonogram_eobFlag + "&dept=" + gMonogram_dept + "&effort=" + gMonogram_effort + "&item=" + gMonogram_itemNbr + "&pageType=" + gMonogram_pageType;
        else
            queryStr += "&eob=" + eobFlag + "&dept=" + dept + "&effort=" + effort + "&item=" + item + "&pageType=" +pageType;
    }

    monogramColors = monogramColorsField;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackMonogramColors);
}


var processMonogramColors = function(o)
{
	var x = eval('(' + o.responseText + ')');
	var length = x.monogramColors.monogramColor.length;

	for (var i = 0; i < length; i++) {
		var selectIdx = i + 1;
		//don't overwrite the first option of the select menu
		// if there's only one choice, autoselect it
		if (length == 1)
			monogramColors.options[selectIdx] = new Option(x.monogramColors.monogramColor[i].name, x.monogramColors.monogramColor[i].id, true, true);
		else
			monogramColors.options[selectIdx] = new Option(x.monogramColors.monogramColor[i].name, x.monogramColors.monogramColor[i].id);
	}
	ajaxCompleteObject.completeEvent.fire("updateMonogramColorsMethod");
	if (YAHOO.ebauer.productUtils.editProductMode) {
		for (var i = 0; i < monogramColors.length; i++) {
			if (monogramColors[i].value == monogramTextColor) {
				monogramColors.selectedIndex = i;
			}
		}
		updateMonogramFonts(monogramStyle);
	}
};

var callbackMonogramColors =
{
	success : processMonogramColors,
	failure : responseFailure,
	argument: { processType:"monogramcolors" },
	timeout: ajaxCallBackMonogramColorsTimeOut
};

function LoadItemsOnAJAXComplete(name, ajaxCompleteObj) {
	this.name = name;
	this.updateColorsAjaxCompleted = false;
	this.updateSizesAjaxCompleted = false;

	this.updateStylesAjaxCompleted = false;
	this.updateMonogramColorsAjaxCompleted = false;
	this.updateFontsAjaxCompleted = false;

	this.ajaxCompleteObj = ajaxCompleteObj;
	this.ajaxCompleteObj.completeEvent.subscribe(this.onCompleteEvent, this);
}

LoadItemsOnAJAXComplete.prototype.onCompleteEvent = function(type, args, me) {
	if (args[0] == 'updateColorsMethod') {
		this.updateColorsAjaxCompleted = true;
	} else if (args[0] == 'updateSizesMethod') {
		this.updateSizesAjaxCompleted = true;
	} else if (args[0] == 'updateStylesMethod') {
		this.updateStylesAjaxCompleted = true;
	} else if (args[0] == 'updateMonogramColorsMethod') {
		this.updateMonogramColorsAjaxCompleted = true;
	} else if (args[0] == 'updateFontsMethod') {
		this.updateFontsAjaxCompleted = true;
	}
	if (this.updateColorsAjaxCompleted == true && this.updateSizesAjaxCompleted == true) {
		this.updateColorsAjaxCompleted = false;
		this.updateSizesAjaxCompleted = false;
	}

	if (this.updateStylesAjaxCompleted == true && this.updateMonogramColorsAjaxCompleted == true) {
		this.updateStylesAjaxCompleted = false;
		this.updateColorsAjaxCompleted = false;
		this.updateFontsAjaxCompleted = false;
	}
};

function AJAXComplete(name) {
	this.name = name;
	this.completeEvent = new YAHOO.util.CustomEvent("completeEvent", this);
}

var ajaxCompleteObject;
ajaxCompleteObject = new AJAXComplete("productAllAjaxCalls");
var loadItemsOnAjaxComplete = new LoadItemsOnAJAXComplete("myconsumer", ajaxCompleteObject);

/** Individual ITEM EDIT , GIFT BOX EDIT, MONOGRAM EDIT from SHopping bag **/



function loadGiftBoxDetailsForItem(itemUUID) {
	editedItemUUID = itemUUID;
	var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/loadGiftBoxDetails.jsp?uuid=' + editedItemUUID, callbackLoadGiftBox);
}

var processLoadGiftBox = function(o) {
	var x = eval('(' + o.responseText + ')');
	isGiftBoxSelectedOLD = true;
	giftBoxFrom = x.item.giftboxfrom;
	giftBoxTo = x.item.giftboxto;
	giftBoxMsg = x.item.giftboxmsg;
	if (giftBoxTo == undefined) { //for addgiftbox it get the values with undefined value
		giftBoxFrom = '';
		giftBoxTo = '';
		giftBoxMsg = '';
	}
	var uuid = x.item.uuid;
	editedItemUUID = x.item.uuid;
	mode = 'edit';
	YAHOO.util.Event.onAvailable("giftboxmsg", loadGiftToForm);
};

var callbackLoadGiftBox =
{
	success : processLoadGiftBox,
	failure : responseFailure,
	argument: { processType:"loadgiftbox" },
	timeout: ajaxCallBackLoadGiftBoxTimeOut
};



function loadMonogramDetailsForItem(itemUUID, siteCss) {
	var mgmQStrng = "";
    if (itemUUID != "" && itemUUID) {
		mgmQStrng = "uuid=" + itemUUID;
        mgmQStrng = mgmQStrng + "&siteCss=" + siteCss;
        var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/loadMonogramDetails.jsp?' + mgmQStrng, callbackLoadMonogram);
	}
	else {
		loadModalMonogram(null, siteCss);
	}
}



var editedMonogramObj;
function loadModalMonogram(o, siteCss) {
    clearMonogramSettings();
    if (o != null)
		editedMonogramObj = eval('(' + o.responseText + ')');
    if (siteCss == undefined) {
       siteCss = editedMonogramObj.siteCss;
    }
    var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/modal_monogram.jsp?siteCss=' + siteCss + '&site=', callbackLoadMonogramModal);
}

var callbackLoadMonogram =
{
	success : loadModalMonogram,
	failure : responseFailure,
	argument: { processType:"loadmonogram" },
	timeout: ajaxCallBackLoadMonogramTimeOut
};

var processClearMonogram = function()
{
	monogramStyle = null;
	monogramTextColor = null;
	monogramTextStyle = null;
	monogramText = null;
	monogram_instructions = null;
	monogram_initial_1 = null;
	monogram_initial_2 = null;
	monogram_initial_3 = null;
	monogram_lines = null;
	mgmflag = "N";

};
var processLoadMonogram = function(o)
{
	YAHOO.ebauer.transitions.handleSuccess(o);
	var form = $('monogram_form');
	var continueWithout = $('continueWithout');
	var close = createDOM('a', { 'id': 'close', 'class': 'closeX', 'href': 'javascript:closeProductInfoLayer();' });
	form.insertBefore(close, continueWithout.nextSibling);
	if (YAHOO.ebauer.productUtils.editProductMode) {
		$("cancelMonogram").style.visibility = "hidden";
	}
	if (editedMonogramObj != undefined) {
		var x = editedMonogramObj;
		productId = x.productid;
        siteCss = x.siteCss;

        if ("EOB" == x.itemType || "eob" == x.itemType) {
            gMonogram_eobFlag = "true";
            gMonogram_dept = x.department;
            gMonogram_effort = x.effort;
            gMonogram_itemNbr = x.itemNbr;
            gMonogram_pageType = x.pageType;
        }
        if ("Y" == editedMonogramObj.mgmflag) {
			isMonogramSelectedOLD = 'Y';
			queryString = '';
			ensembleId = x.item.mgmEnsembleId;
			monogramStyle = x.item.mgmstyle;
			monogramTextColor = x.item.mgmcolor;
			monogramTextStyle = x.item.mgmfont;
			monogramText = x.item.mgmtext;
			monogram_instructions = x.item.mgminstruction;
			monogram_initial_1 = null;
			monogram_initial_2 = null;
			monogram_initial_3 = null;
			monogram_lines = null;
			if (monogramStyle == 2) {
				monogram_initial_1 = monogramText;
			}
			else if (monogramStyle == 3 || monogramStyle == 6) {
				monogram_initial_1 = monogramText.substring(0, 1);
				monogram_initial_2 = monogramText.substring(2, 3);
				monogram_initial_3 = monogramText.substring(4);
			}
			else if (monogramStyle == 11) {
				monogram_initial_1 = monogramText.substring(0, 1);
				monogram_initial_2 = monogramText.substring(2);
			}
			else {
				monogram_lines = monogramText;
			}

			isMonogramAllowed = 'Y';
			colorIdSelected = -1;
			sizeIdSelected = -1;
			mgmenabledflag = "Y";
			mgmflag = "Y";
		}

        var uuid = x.item.uuid;
        editedItemUUID = x.item.uuid;
        mode = 'edit';
    }
// cmCreatePageviewTag("modal_monogram.jsp",categoryId);
};

var callbackLoadMonogramModal =
{
	success : processLoadMonogram,
	failure : responseFailure,
	argument: { processType:"loadmonogrammodal" },
	timeout: ajaxCallBackLoadMonogramModalTimeOut
};

/**
 * This function first finds the inseam length for the given 'hemType' in cache. If inseam length
 * is found in the cache, it's retrieved and displayed to the user , otherwise AJAX call is made to
 * retrieve the inseam length from the server.
 */
var selectedHemStyle = "";
function getInseamLength(hemStyle) {
	var cachedInseamLength;
	var product_id = getProductId();
	selectedHemStyle = hemStyle.value;
	cacheManagerObj = getCacheManager();
	if (cacheManagerObj.isCacheAvailable(product_id + '_INSEAM_LENGTH', selectedHemStyle)) {
		cachedInseamLength = cacheManagerObj.getCacheContent(product_id + '_INSEAM_LENGTH', selectedHemStyle);
		displayInseamLength(cachedInseamLength);
	}
}

/**
 * It takes the JSONObject as parameter which holds the inseam length (min & max) for selected hemStyle
 */
function displayInseamLength(inseamLength, idx) {
	var inseamLengthId = (idx != undefined) ? "inseamLength_" + idx : "inSeamLength";
	var selectInseamlength = $("" + inseamLengthId);
	selectInseamlength.innerHTML = "";
	var arrQuarter = new Array(4);
	arrQuarter[0] = "";
	arrQuarter[1] = "1/4";
	arrQuarter[2] = "1/2";
	arrQuarter[3] = "3/4";
	var optionElement = createDOM('option', {'value':'default' , 'selected':'selected'});
	optionElement.appendChild(document.createTextNode('Select Inseam Length'));
	selectInseamlength.appendChild(optionElement);
    //BUG00234
    var selectedInseamLength = getValueFromElement('selectedInseamLength');

    var inseamLength_min = inseamLength.inseamLength_min;
	var insemaLength_max = inseamLength.inseamLength_max;
	if (inseamLength_min > 0 && insemaLength_max > 0) {
		var arrQuarter_length = arrQuarter.length;
		for (i = inseamLength_min; i <= insemaLength_max; i++) {
			if (i == insemaLength_max) arrQuarter_length = 1;
			for (j = 0; j < arrQuarter_length; j++) {
				if (j != 0) {
					optionElement = createDOM('option', {'value':'' + i + '-' + arrQuarter[j]});
                    //BUG00234
                    if (optionElement.value == selectedInseamLength){
                        optionElement.selected = true;
                    }
                    var displayContent = i + ' - ' + arrQuarter[j];
					optionElement.appendChild(document.createTextNode(displayContent));
				}

				//selectInseamlength.innerHTML += "<option value='" + i + "@" + arrQuarter[j] + "'>" + i + " - " + arrQuarter[j] + "</option>";
				else {
					optionElement = createDOM('option', {'value':'' + i});
                    //BUG00234
                    if (optionElement.value == selectedInseamLength){
                        optionElement.selected = true;
                    }
					optionElement.appendChild(document.createTextNode(i));
				}
				//selectInseamlength.innerHTML += "<option value='" + i + "'>" + i + "</option>";
				selectInseamlength.appendChild(optionElement);
			}
		}
		selectInseamlength.disabled = false;
	}
	updateCount += 1;
    //BUG00248
    YAHOO.ebauer.productUtils.toggleAddToButton();
}


var initInseam = function() {
	var cachedInseamLength = null;
	var product_id = getProductId();
	cacheManagerObj = getCacheManager();
	cachedInseamLength = cacheManagerObj.getCacheContent(product_id + '_INSEAM_LENGTH');

	queryStr = getBaseURL() + "/ajax/get_inseam_length.jsp?product_id=" + product_id;

	var eobFlag = getValueFromElement('eob');
	if (eobFlag == 'true') {
		var dept = getValueFromElement('dept');
		var effort = getValueFromElement('effort');
		var item = getValueFromElement('item');
		var pageType = getValueFromElement('pageType');
		queryStr = queryStr + '&eob=true&dept=' + dept + '&effort=' + effort + '&item=' + item + '&pageType=' + pageType;
	}

    var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackInseamLength);
};


/**
 *  method which puts the inseam length from the server in cache.
 */
var processInseamLength = function(o)
{
	var x = eval('(' + o.responseText + ')');
	if (x.idx != undefined) {
		processInseamLengthMPP(x);
		return;
	}
	var product_id = getProductId();
	var cuffed_length = '{"inseamLength_min":"' + x.minCuffLength + '","inseamLength_max":"' + x.maxCuffLength + '"}';
	var plain_length = '{"inseamLength_min":"' + x.minPlainLength + '","inseamLength_max":"' + x.maxPlainLength + '"}';
	var cuffed_length_obj = eval('(' + cuffed_length + ')');
	var plain_length_obj = eval('(' + plain_length + ')');
	// Add the length values to the cache
	cacheManagerObj = getCacheManager();
	// Usage : -- setCache(cacheKey,cacheContentKey,cacheContentObj);
	cacheManagerObj.setCache(product_id + '_INSEAM_LENGTH', "Cuffed", cuffed_length_obj);
	cacheManagerObj.setCache(product_id + '_INSEAM_LENGTH', "Plain", plain_length_obj);

    //BUG00234
    var hemStyleSel = YAHOO.util.Dom.get('hemStyle');
    var selectedHemStyle = getValueFromElement('selectedHemStyle');

    hemStyleSel.length = 1; //reset the menu
	var hasOptions = false;
	if (eval(x.minCuffLength) > 0 && eval(x.maxCuffLength) > 0) {
        //BUG00234
        if (selectedHemStyle == 'Cuffed'){

            var optionElement = createDOM('option', {'value':'Cuffed' , 'selected':'selected'});
            getInseamLength(optionElement);
        } else {
            var optionElement = createDOM('option', {'value':'Cuffed'});
        }
		optionElement.appendChild(document.createTextNode('With Cuffs'));
		hemStyleSel.appendChild(optionElement);
		hasOptions = true;
	}
	if (x.minPlainLength > 0 && x.maxPlainLength > 0) {
        //BUG00234
        if (selectedHemStyle == 'Plain'){

            var optionElement = createDOM('option', {'value':'Plain' , 'selected':'selected'});
            getInseamLength(optionElement);
        } else {
            var optionElement = createDOM('option', {'value':'Plain'});
        }
		optionElement.appendChild(document.createTextNode('Without Cuffs'));
		hemStyleSel.appendChild(optionElement);
		hasOptions = true;
	}
	if (hasOptions){
		var optionElement = createDOM('option', {'value':'Unfinished'});
        if (optionElement.value == selectedHemStyle){
            optionElement.selected = true;
        }
    } else{
		var optionElement = createDOM('option', {'value':'Unfinished' , 'selected':'selected'});
    }
    optionElement.appendChild(document.createTextNode('Unfinished'));
	hemStyleSel.appendChild(optionElement);

    //BUG00248
    YAHOO.ebauer.productUtils.toggleAddToButton();
};

/**
 *  method which puts the inseam length from the server in cache.
 */
var processValidateSku = function(o)
{
	var x = eval('(' + o.responseText + ')');
	var result = x.result;
	var dept = x.department;
	var effort = x.effortcode;
	var item = x.itemNbr;
	var source = x.source;
    var searchCookie = GetCookie("EOB_Search");
    var firsteffort = x.firsteffort;
    var pricetypecode = x.pricetypecode;
    

    if (result == 'false') {  //if not valid, set the vld flag to 1
        if(searchCookie != "" && searchCookie != null) {
            resetCookie('EOB_Search','',1);
            document.location.href = getBaseURL() + '/catalog/catalog_quick_order.jsp?dept=' + dept + "&effort=" + effort + "&item=" + item + "&fmt=0&vld=1"  + "&Ntk=IALL&Ntt=&cm_se=" + searchCookie + "&cm_sr=0";
        } else {
            document.location.href = getBaseURL() + '/catalog/catalog_quick_order.jsp?dept=' + dept + "&effort=" + effort + "&item=" + item + "&fmt=0&vld=1";
        }
    } else {
		//YAHOO.ebauer.layerbox.transition('eobproduct', x);
		var params = '?dept=' + dept + '&effort=' + effort + '&item=' + item + '&source=' + source + '&eobSource=' + source + '&firsteffort=' + firsteffort + '&pricetypecode=' + pricetypecode;
        document.location.href = getBaseURL() + '/catalog/eob_product.jsp'+params;
	}
};

var updateClose = function () {
	jQuery('#dossier.eob.PPL').css({
		padding : "10px 0 0 0 !important"
	});
	jQuery('#fbBox #fbBoxLiner').css({
		height: "100%",
    	left: "-3px",
    	position: "relative",
    	top: "0",
    	width: "100%"
	});
}

var processUpdateItemCount = function(o)
{
	var x = eval('(' + o.responseText + ')');
	var count = x.itemsCount;
	if ($("itemsCount") != undefined ) {
		if (count == 1) {
		  $("itemsCount").innerHTML = count + " Item";		  
		} else {
		  $("itemsCount").innerHTML = count + " Items";		  
		}
		jQuery('#shoppingBag').addClass('items').addClass('itemsTrue');		
	}
};



/**
 *EOB related methods
 **/

function getValueFromElements(filedname) {
	var flds = document.getElementsByName(filedname);
	if ((flds != null) && (flds.length != undefined)) {
		for (var i = 0; i < flds.length; i++) {
			if (flds[i].checked) {
				return flds[i].value;
			}
		}
	} else {
		var fld = document.getElementById(filedname);
		if (fld != null)
			return fld.value;
		else
			return '';
	}
}


function getIndexFromElements(filedname) {
	var flds = document.getElementsByName(filedname);
	if ((flds != null) && (flds.length != undefined)) {
		for (var i = 0; i < flds.length; i++) {
			if (flds[i].checked) {
				return (i + 1);
			}
		}
	} else {
		var fld = document.getElementById(filedname);
		if (fld != null)
			return 1;
		else
			return 0;
	}
}


function getValueFromElement(fieldname) {
	var fld = document.getElementById(fieldname);
	if (fld != null)
		return fld.value;
	else
		return '';
}

function displayImages(images, colors) {
	var length = images.length;
	var imageElement = $("select_all");
	for (var i = 0; i < length; i++) {
		var colorId = images[i].key;
		var imageUrl = images[i].value;
		var imageInput = createDOM('input', {'type':'hidden', 'id':'image_src_' + colorId , 'value':'' + imageUrl});
		imageElement.appendChild(imageInput);
	}
}

function changeMainImage(imageUrl, shownInColorName) {
	if (eobFlag != 'true' || pageType != 'CATALOGONLY') {
		var shownInObj = $("shownIn");
		var shownInHTML = "";

		if (imageUrl == null || imageUrl == "" || imageUrl.indexOf("NO_IMAGE") > 0) {
            shownInHTML = 'Photo not available';
            //ENH00191
            YAHOO.ebauer.canvas.setImage(imageUrl);

            if (shownInColorName && shownInColorName != "" && shownInColorName != "null")
				shownInHTML += ' in: <strong>' + shownInColorName + '</strong>';
		} else {
			if (YAHOO.ebauer.productUtils.basicMode == true) {
				//var prodimg = new YAHOO.util.Element('prodImage');
				var prodimg = YAHOO.util.Dom.get('prodImage');
				prodimg.src = imageUrl;
			} else {
				YAHOO.ebauer.canvas.setImage(imageUrl);
			}
			shownInHTML = 'Shown in: <strong>' + shownInColorName + '</strong>';
		}

		if (shownInObj != null && shownInObj != undefined)
			shownInObj.innerHTML = shownInHTML;
		//update the swatch name as well
		//$("swatchName").innerHTML = shownInColorName;
	}
}

function updateAltButton() {
	var eobFlag = getValueFromElement('eob');
	var pageType = getValueFromElement('pageType');
}

var selectedButtonObj = "";

function chAltImg(imageUrl, shownInColorName, j, el) {
	var cmTitle = el.title;
	var cmhref = "chAltImg('"+ imageUrl +"','"+shownInColorName+"',2,this);";
	cmCreateManualLinkClickTag(cmhref,"Alt Images:"+cmTitle);
	changeMainImage(imageUrl, shownInColorName);
	YAHOO.ebauer.productUtils.setAltImgIcon(el);
}


var selectedSwatchName = "";
function changeColorText(colorName) {
	$("swatchName").innerHTML = colorName;
}

// Function to display the product page
var showSelectedValues = false;

function revertColorText() {
	if (selectedSwatchName == "")
		selectedSwatchName = "&nbsp;";
	$("swatchName").innerHTML = selectedSwatchName;
}

function showZoomIn() {
	var prodImageContainer = document.getElementById("prodImageContainer");
	var box = createDOM('div', {'class':'something'});
	box.appendChild(document.createTextNode('Zoomed in'));
	prodImageContainer.appendChild(box);
}

function buildZoomImage(imageURL) {
	var swfName = $("swfFile").value;
	var params = {};
    var vars = {};
	vars['from'] = escape(window.location);
	vars['image'] = escape(imageURL);
	vars['policy'] = escape("http://s7d2.scene7.com/crossdomain.xml");
	params['allowscriptaccess'] = "always";
	params['wmode'] = "transparent";
	params['scale'] = "noscale";
	swfobject.embedSWF(swfName, "prodImageContainer", "400", "500", "8", "/expressInstall.swf", vars, params);
}

function displaySelectedValues(updateCountExpected) {
	if (giftBoxSelectedValues == undefined || giftBoxSelectedValues.length == undefined || giftBoxSelectedValues.length < 6) {
		return;
	}
	//Check if all AJAX call has been made
    if ($("alsoModule") != null) {
	    $("alsoModule").style.display = "none";
    }
    if ($("outfit_link") != null) {
        $("outfit_link").style.display = "none";
    }
    // BUSY Wait till the colors and sizes are loaded, and they are matching with the length expected.
    if (isNaN(updateCount)
            || updateCount < updateCountExpected
            || $("color").length < colorsLength
            || $("size").length < sizesLength) {
        the_timeout = setTimeout('displaySelectedValues(' + updateCountExpected + ')', 50);
    } else {
        selectValues("color", giftBoxSelectedValues[1]);
		var currentColorId = getValueFromElement("color");
        if (currentColorId == null || currentColorId.length == 0 || currentColorId == "null") {
            currentColorId = getValueFromElement("defaultColorId");
        }
        changeProductLabel(currentColorId);
        selectValues("size", giftBoxSelectedValues[2]);
		selectValues("quantity", giftBoxSelectedValues[3]);
		selectValues("inSeamLength", giftBoxSelectedValues[5]);
        //gGetSizeFlag = false;//BUG000217
        //swatchSelect(currentColorId);//BUG000217
    }
    YAHOO.ebauer.productUtils.toggleAddToButton();
}

var editedItemUUID = null;
var editedItemUserItemId = null;
var calledFromLayerPage = false;
var submitSaveBtnClicked = false;
var isEditedItemFromWishList = false;
editItemInCart = function(uuid, isLayerPage, categoryId, imageName, imageTypeCode, isWishListItem) {
   isEditedItemFromWishList = isWishListItem;
	var keyValue = '';
	if (isWishListItem == true) {
		editedItemUserItemId = uuid;
		keyValue = 'useritemid='+uuid;
	} else {
		editedItemUUID = uuid;
		keyValue = 'uuid='+uuid;
	}
	 YAHOO.ebauer.productUtils.resetFlags();
	if (categoryId != null) {
		gCategoryId = categoryId;
	}
	calledFromLayerPage = isLayerPage;
	var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/loadItemDetailsForEdit.jsp?'+keyValue+ '&imageName=' + imageName + '&imageTypeCode=' + imageTypeCode, callbackLoadItemForEdit);
	closeProductInfoLayer();	
}

function displayDefaultValuesOnEdit() {
	
	jQuery.fn.ProductModule();
	
	var updateCountExpected = 2;
	var cutType = itemForEditValues.item.cutType;
	var colorid = itemForEditValues.item.colorid;
	var defaultColorName = itemForEditValues.item.defaultColorName;
	var defaultImageUrl = itemForEditValues.item.defaultImageUrl;
	var sizeid = itemForEditValues.item.sizeid;
	var quantity = itemForEditValues.item.quantity;
	var productId = itemForEditValues.item.productid;
	var categoryid = itemForEditValues.item.categoryid;
	var clearanceFlag = itemForEditValues.item.clearanceFlag;
	var ensid = itemForEditValues.item.ensid;
	var itemType = itemForEditValues.item.itemType;
	var regularPrice = itemForEditValues.item.regularPrice;
	var totalPrice = itemForEditValues.item.totalPrice;
	var currentprice = itemForEditValues.item.currentprice;
	var invstatus = itemForEditValues.item.invstatus;
	var hemStyle = itemForEditValues.item.hemStyle;
	var inseamLength = itemForEditValues.item.inseamLength;
	var thresholdQty = 10;
	
	jQuery('input[name=productId]').val(productId);
	
	if (itemForEditValues.item.giftboxflag == 'Y') {
		YAHOO.ebauer.productUtils.isGiftBoxSelected = true;
		jQuery('#giftbox').attr('checked','checked');
		giftBoxFrom = itemForEditValues.item.giftboxfrom;
		giftBoxTo = itemForEditValues.item.giftboxto;
		giftBoxMsg = itemForEditValues.item.giftboxmsg;
	}
	if (itemForEditValues.item.mgmflag == 'Y') {		
		jQuery('#monogramCheck').attr('checked','checked');
		YAHOO.ebauer.productUtils.isMonogramSelected = true;
		monogramChkBox.checked = true;
		monogramStyle = itemForEditValues.item.mgmstyle;
		monogramTextColor = itemForEditValues.item.mgmcolor;
		monogramTextStyle = itemForEditValues.item.mgmfont;
		monogramText = itemForEditValues.item.mgmtext;
		monogram_instructions = itemForEditValues.item.mgminstruction;
		monogram_initial_1 = null;
		monogram_initial_2 = null;
		monogram_initial_3 = null;
		monogram_lines = null;
		if (monogramStyle == 2) {
			monogram_initial_1 = monogramText;
		} else if (monogramStyle == 3 || monogramStyle == 6) {
			monogram_initial_1 = monogramText.substring(0, 1);
			monogram_initial_2 = monogramText.substring(2, 3);
			monogram_initial_3 = monogramText.substring(4);
		} else if (monogramStyle == 11) {
			monogram_initial_1 = monogramText.substring(0, 1);
			monogram_initial_2 = monogramText.substring(2);
		} else {
			monogram_lines = monogramText;
		}
		monogramIgnoredFlag = false;
	}	
	
	if (clearanceFlag === true) {
		getColorsSizesPage();
	} else {
		getColorsPage();
		getSizesPage();	
	}
	
	// Set selected color name
	if(defaultColorName !=""){		
		jQuery('#change_col_text span.colorName').html(defaultColorName);
		jQuery('.imageColor span.name').html(defaultColorName);		
	}

	// Set radio cut type button
	if(cutType !=""){			
		var radioButton = "input:radio[value="+productId+"]";		
		jQuery(radioButton).attr('checked',true);	
		updateInseam();
	}	
	if (quantity !=""){
		jQuery('#quantity').val(quantity);
	}
	if (itemForEditValues.item.inseamflag == 'Y') {		
		inseamFlag = itemForEditValues.item.inseamflag;
		selectValues("hemStyle", itemForEditValues.item.hemStyle);
		if (jQuery('#hemStyle').value != "Unfinished" && jQuery('#hemStyle').value != "default") {
			updateCountExpected = 3;
			//getInseamLength(jQuery('#hemStyle'));
			jQuery(targetPage+'input[name=selectedInseamLength]').val(inseamLength);
			jQuery(targetPage+'input[name=selectedHemStyle]').val(hemStyle);
						
			updateInseamLength();			
		}
	}
	zoomImageCheckPP = function(){			
		var imageSrc = jQuery('.mainImage img').attr('src');		
		if (imageSrc != "" && imageSrc != undefined){
			var zoomMessage = '<div class="Zoomable"><span class="icon zoomMessage"></span><span class="text">Roll over image to zoom in</span><a href="javascript:void(0);" class="zoomFullScreenAlt"><span class="icon imageMessage"></span><span class="text largerClick">Click for larger image</span></a></div>';
			//check to see if image zoomable
			var startIndex = imageSrc.indexOf('/EB');
			var imageCode = imageSrc.substr(startIndex,7);				
			if (imageCode.indexOf('I') == -1){				
				jQuery('.mainImage').removeClass('Zoom');
				jQuery('.zoomControls').removeClass('Zoom');
				jQuery('.zoomControls').html('<div class="nonZoomable"><span class="text">This image is not Zoomable</span></div>');
				jQuery('.MagicZoomPlusHint').css('display','none');
			}else{					
				jQuery('.mainImage').addClass('Zoom');
				jQuery('.zoomControls').addClass('Zoom');
				jQuery('.zoomControls').html(zoomMessage);
				jQuery('.MagicZoomPlusHint').css('display','block');				
			}
		}
	}
	
	// Set main image
	if(defaultImageUrl !=""){		
		jQuery('.imageStatus').removeClass('loaded').addClass('loading');		
		var mainImageObj = jQuery('#itemZoom img');	
		var mainImageSrc = mainImageObj.attr('src',defaultImageUrl);
		var swatchImage = jQuery('#swatches #swatch'+colorid+' img');			
		var mainImageSrcLarge = defaultImageUrl.replace('$mainImage$&wid=400&hei=496','&wid=3000');	
		jQuery('#itemZoom').attr('href',mainImageSrcLarge);
		MagicZoomPlus.update('itemZoom', mainImageSrcLarge, mainImageSrc, 'disable-expand:true; show-title:false; zoom-position: inner; initialize-on: hover; selectors-class : Active; click-to-activate: false');
		zoomImageCheckPP();
		jQuery('.imageStatus').removeClass('loading').addClass('loaded');		
	}
	MagicZoomPlus.refresh();
	MagicScroll.init();
	
}

function displaySelectedValuesOnEdit(updateCountExpected) {
    // BUSY Wait till the colors and sizes are loaded, and they are matching with the length expected.
    if (isNaN(updateCount)
            || updateCount < updateCountExpected
            || $("color").length < colorsLength
            || $("size").length < sizesLength) {
		the_timeout = setTimeout('displaySelectedValuesOnEdit(' + updateCountExpected + ')', 50);
	} else {
		selectValues("color", itemForEditValues.item.colorid);
		var currentColorId = getValueFromElement("color");
		if (currentColorId == null || currentColorId.length == 0 || currentColorId == "null") {
			currentColorId = getValueFromElement("defaultColorId");
		}
		changeProductLabel(currentColorId);
		colorIdSelected = itemForEditValues.item.colorid;
		selectValues("size", itemForEditValues.item.sizeid);
		sizeIdSelected = itemForEditValues.item.sizeid;
		swatchSelect(itemForEditValues.item.colorid);
        //BUG00248
        if (!showSelectedValuesForBuyAnotherItem) {
            selectValues("quantity", itemForEditValues.item.quantity);
        }
		if (inseamFlag == 'Y' && $("hemStyle").value != "Unfinished" && $("hemStyle").value != "default")
			selectValues("inSeamLength", itemForEditValues.item.inseamLength);
//		YAHOO.util.Dom.replaceClass('addToCart', 'buttonInactive', 'buttonActive');
		YAHOO.ebauer.productUtils.toggleAddToButton();
	}    
}

function selectValues(id, value) {
    if (value == null || value == '' || value == 'default') {
		return;
	}
	var flds = $(id);
    if ((flds != null) && (flds.length != undefined)) {
		for (var i = 0; i < flds.length; i++) {
			if (flds[i].value == value) {
				flds.selectedIndex = i;
				return;
			}
		}
	}
}
var buyAnotherItemFlag = false;
var buyAnotherWishListItemFlag = false;
function buyAnother(newLayer, buyAnotherItemUUID, categoryId, imageName, imageTypeCode) {
	if (categoryId != null && categoryId != 'null')
		gCategoryId = categoryId;
	layerPageFlag = newLayer;
    buyAnotherItemFlag = true;
    var cObj = YAHOO.ebauer.utilities.asyncRequest('GET', getBaseURL() + '/ajax/loadItemDetailsForEdit.jsp?uuid=' + buyAnotherItemUUID + '&imageName=' + imageName+ '&imageTypeCode=' + imageTypeCode, callbackLoadBuyAnotherItemForEdit);
}

var showSelectedValuesForBuyAnotherItem = false;
var processLoadBuyAnotherItem = function (o) {
    var x = eval('(' + o.responseText + ')');
    updateCount = 0;
    showSelectedValuesForBuyAnotherItem = true;
    itemForEditValues = x;
    queryString = '';
    ensembleId = x.item.ensid;
    parentEnsembleId = ensembleId;

    if (x.item.colorid != undefined) {
        colorId = x.item.colorid;
    }

    //changes for bug 0963
    if (x.item.defaultImageUrl != undefined && x.item.defaultImageUrl != '') {
        var startIndex = x.item.defaultImageUrl.lastIndexOf("/");
        var endIndex = x.item.defaultImageUrl.indexOf("?");
        if (startIndex != -1 && endIndex != -1) {
            imageName = x.item.defaultImageUrl.substring(startIndex + 1, endIndex);
            var colorIndex = imageName.lastIndexOf("_");
            if (colorIndex != -1) {
                imageTypeCode = imageName.substring(colorIndex + 4, colorIndex + 5);
            }
        }
    }

    if (x.item.clearanceFlag)
        gCs = "1";

    if (YAHOO.ebauer.productUtils.productPageMode) {
        // clicks Buy Another from the added interstitial, on top of the standalone product page
        var layerboxState = YAHOO.ebauer.layerbox.getLayerboxState();
        // clicks from the added interstitial, on top of the standalone product page
        if (layerboxState != "")
            YAHOO.ebauer.layerbox.hideLayer();
    }

    var categoryName = "Previous Page";
    if (YAHOO.ebauer.bagUtils) {
        categoryName = "Shopping Bag";
    } else if (buyAnotherWishListItemFlag == true) {
        categoryName = "Wish List";
    } else if (gBackToCat != undefined && gBackToCat != '') {
        categoryName = gBackToCat;
    }

    queryString += 'categoryName=' + categoryName;

    if (x.item.itemType == "EOB" || x.item.originalItemType == "EOB") {
        queryString += '&dept=' + x.item.departmentprefix + x.item.department + '&effort=' + x.item.effortcode + '&item=' + x.item.itemNbr + '&colorid=' + x.item.colorid + '&sizeid=' + x.item.sizeid + '&defaultColorName=' + x.item.defaultColorName + '&clearanceFlag=' + x.item.clearanceFlag + '&eobSource=' + (eobSource != '' ? eobSource : 'Shopping Bag');
        //if (YAHOO.ebauer.productUtils.productPageMode)
        //	YAHOO.ebauer.transitions.swapHtml(YAHOO.ebauer.layerbox.getConfigObject('eobproduct'), {divOverride:'dossier_wrapper'});
        //else
        //	YAHOO.ebauer.layerbox.transition('eobproduct', x.item);
       	var pplURL = rewirteUrl('/catalog/eob_product.jsp?standalone=N&' + queryString);
    	var pplType = 'ajax';
    	var pplParams = 'height:600 width:968 autoFitHTML:true scrolling:no padding:0 panelPadding:20 outerClose:true controlsPos:tr';
    	var pplCallBacks = '';		
    		openPPL(pplURL, pplType, pplParams, pplCallBacks);
    }
    else {


        queryString += '&productId=' + x.item.productid;
        //BUG00248
        queryString += '&selectedColorId=' + x.item.colorid + '&selectedSizeId=' + x.item.sizeid;

        if (gCs != "" && gCs != null) {
            queryString += "&cs=" + gCs;
            colorIdSelected = x.item.colorid;
            sizeIdSelected = x.item.sizeid;
        }

        //BUG00248
        if (x.item.inseamflag == "Y") {
            var hemStyleString = x.item.hemStyle;
            var inSeamLengthString = x.item.inseamLength;
            queryString += "&selectedHemStyle=" + hemStyleString + "&selectedInseamLength=" + inSeamLengthString;
        }

        if (x.item.categoryid != "") {
            queryString += "&categoryId=" + x.item.categoryid;
        }
        //if (YAHOO.ebauer.productUtils.productPageMode)
        //	YAHOO.ebauer.transitions.swapHtml(YAHOO.ebauer.layerbox.getConfigObject('product'), {ensembleId:ensembleId,divOverride:'dossier_wrapper'});
        //else
        //	YAHOO.ebauer.layerbox.transition('product', {ensembleId:ensembleId});
      	var pplURL = rewirteUrl('/catalog/product.jsp?standalone=N&ensembleId=' + ensembleId + '&' + queryString);
    	var pplType = 'ajax';
    	var pplParams = 'height:600 width:968 autoFitHTML:true scrolling:no padding:0 panelPadding:20 outerClose:true controlsPos:tr';
    	var pplCallBacks = '';		
    		openPPL(pplURL, pplType, pplParams, pplCallBacks);
    }
};



var processInterstitialContent = function(o) {
	var x = eval('(' + o.responseText + ')');
	var targetedContentInfo = {
	 targetedContent : x.targetedContent,
	 parentNode : x.parentNode
		};
	if (x.targetedContent != '' && x.targetedContent && x.targetedContent != undefined) {
		YAHOO.util.Event.onAvailable(x.parentNode, loadTargetedContent, targetedContentInfo);
	}
};

var callbackInseamLength =
{
	success : processInseamLength,
	failure : responseFailure,
	argument: { processType:"inseamLength" },
	timeout: ajaxCallBackInseamLengthTimeOut
};

var callbackItemCount =
{
	success : processUpdateItemCount,
	failure : responseFailure,
	argument: { processType:"updateItemCount" },
	timeout: ajaxCallBackItemCountTimeOut
};

var callbackValidateSku =
{
	success : processValidateSku,
	failure : responseFailure,
	argument: { processType:"validateSku" },
	timeout: ajaxCallBackValidateSKUTimeOut
};

var callbackInterstitialContent =
{
	success : processInterstitialContent,
	failure : responseFailure,
	argument: { processType:"InterstitialContent" },
	timeout: ajaxCallBackInterstitialContentTimeOut
};

var callbackLoadBuyAnotherItemForEdit =
{
	success : processLoadBuyAnotherItem,
	failure : responseFailure,
	argument: { processType:"loadBuyAnotherItem" },
	timeout: ajaxCallBackLoadBuyAnotherItemForEditTimeOut
};

function loadTargetedContent(targetedContentInfo) {
	$(targetedContentInfo.parentNode).innerHTML = targetedContentInfo.targetedContent;
}

function getInterstitialContent(page, parentNode) {
	queryStr = getBaseURL() + "/ajax/get_interstitial_content.jsp?name=" + page+"&nTargeted=3&parentNode="+parentNode;
	var connectionObject = YAHOO.ebauer.utilities.asyncRequest('GET', queryStr, callbackInterstitialContent);
};


var processProductInfo = function(o) {
	var x = o.responseText ;
	var popupLayerField = $("popupLayer_" + gLayerIndex);
	popupLayerField.innerHTML = x;
};


function getProductInfo(sectionId, sectionName) {
	YAHOO.ebauer.transitions.transitionContentPage(sectionId, sectionName);
}

function isValidMonogramText(text) {
	var trimmedText = trim(text);
	if (trimmedText == '') {
		resetPreviewBox();
		return false;
	}
	return true;
}

//Monogram only allows the [a-z],[A-Z],[Tab-space] and [spaces].
function containsValidChars(text) {
	var objRegExp = /^[a-zA-Z][a-zA-Z\t\v\n\r ]*$/;
	if (!objRegExp.test(text)) {
		resetPreviewBox();
		return false;
	}
	return true;
}

function containsValidWords(text) {
	var objRegExp = /^[a-zA-Z0-9\s\t\v\n\r]*[\&\@\#\-\"\'\.\/\*\,,]*[a-zA-Z0-9\s\t\v\n\r]*[\&\@\#\-\"\'\.\/\*\,,]*[a-zA-Z0-9\s\t\v\n\r]*[\&\@\#\-\"\'\.\/\*\,,]*[a-zA-Z0-9\s\t\v\n\r]*$/;
	if (!objRegExp.test(text)) {
		resetPreviewBox();
		return false;
	}
	return true;
}

function trim(text) {
	// Remove all white spaces in the value
    if (text) {
        while (text.substring(0, 1) == ' ') {
            text = text.substring(1, text.length);
        }
    }
	return text;
}

function changeMonogramColor(selectObj) {
	//set background swatch to dl background
	var previewDl = $("monogramPreview");	
	if (previewDl != null && selectSwatchSrc != ""){
		YAHOO.util.Dom.setStyle(previewDl, "background-image", "url("+selectSwatchSrc+")");
	}else if (previewDl != null && selectSwatchSrc == "" && swatchImageMonogramSrc !=""){
		YAHOO.util.Dom.setStyle(previewDl, "background-image", "url("+swatchImageMonogramSrc+")");		
	}

	var previewTextObj = $("previewTextDt");
	if ((previewTextObj != undefined && previewTextObj != null) && (selectObj != null && selectObj != undefined)) {
		var colorName = selectObj.options[selectObj.selectedIndex].text;
		try {
			//added this code so that the color attribute is reset atleast to empty if colorname is not valid
			if (previewTextObj.style.color != undefined)
				previewTextObj.style.color = "";
			var previewTextObjclass = trim(previewTextObj.className);
			if (previewTextObjclass.indexOf("mgm_") != -1) {
				if (previewTextObjclass.indexOf(" ") != -1) {
					YAHOO.util.Dom.removeClass(previewTextObj, previewTextObjclass.substring(previewTextObjclass.indexOf("mgm_"), previewTextObjclass.indexOf(" ")));
				}
				else {
					YAHOO.util.Dom.removeClass(previewTextObj, previewTextObjclass.substring(previewTextObjclass.indexOf("mgm_"), previewTextObjclass.length));
				}
			}
			YAHOO.util.Dom.addClass(previewTextObj, "mgm_" + colorName);
			if (changeMonogramColorMode == 'true') {
				displayPreviewText();
			}else if(swatchImageMonogramSrc !=""){
				displayPreviewText();				
			}
		} catch(exception) {
			alert(exception);
		}
		setContinueMonogramButton();
	}
}

// To change the label displayed against the style.
function changeProductLabel(colorId, idx, isEob) {
	if (idx == undefined) {
		var workProdId;
		var productForm = $("productForm");
		if (colorId == null || colorId == "null" || colorId.length == 0) {
			colorId = getValueFromElement("defaultColorId");
		}
		if (productForm.cut.length != undefined) {
			var desCode;
			for (i = 0; i < productForm.cut.length; i++) {
				workProdId = productForm.cut[i].value;
				desCode = getValueFromElement("desCode"+(i+1))
                //ENH00191 - pass in isEob obj to distinguish eob/non-eob logics
                changeAProductLabel(colorId, workProdId, desCode, isEob);
			}
		} else {
			workProdId = productForm.cut.value;
			changeAProductLabel(colorId, workProdId);
		}
	} else {
		var styleIdx = 0;
		var nextProdId = getMPPStyleProdId(idx, styleIdx);
		while (nextProdId != undefined && nextProdId != null) {
			changeAnMPPProductLabel(colorId, nextProdId, idx, styleIdx);
			styleIdx++;
			nextProdId = getMPPStyleProdId(idx, styleIdx);
		}
	}

	if (YAHOO.ebauer.productUtils.basicMode == true) {
		YAHOO.ebauer.productUtils.copyBasicStyleValues();
	}
}

function changeAProductLabel(colorId, prodId, desCode, isEob) {
    //ENH00191 - For EOB, take the highest price of the style as default price
    var thisSalePrice = null;
    if (isEob){

        thisSalePrice = colorPrices.getStyleHighCurPrice(prodId);
    } else {

        thisSalePrice = colorPrices.getCurPriceInfo(prodId, colorId);
    }


	var thisRegPrice = colorPrices.getRegPriceInfo(prodId, colorId);

    //BUG01224 - this default color product is probably sold out or doesn't exist
    if ( (thisSalePrice==null || thisSalePrice=="" || thisSalePrice=="null") &&
         (thisRegPrice==null || thisRegPrice=="" || thisRegPrice=="null") ) {
           colorId=null;
    }


	if (allMarkedDown || colorId == null || colorId == "null") {
		thisRegPrice = colorPrices.getStylePrice(prodId);
           var allMarkedDown = colorPrices.getStyleAllMarkedDown(prodId);
		if (allMarkedDown) {
			thisSalePrice = colorPrices.getStyleHighCurPrice(prodId);
		} else {
			thisSalePrice = thisRegPrice;
		}

	}
	if (thisRegPrice == null || thisRegPrice.length == 0) {
		thisRegPrice = regPrice;
	}
	if (thisSalePrice == null || thisSalePrice.length == 0) {
		thisSalePrice = thisRegPrice;
	}
	prodLabelObj = $(prodId + "_label");

	if (prodLabelObj != null && prodLabelObj != undefined) {
		var temp = prodLabelObj.innerHTML;
		var ind = temp.indexOf('<');
		if (ind > 0) {
			temp = temp.substring(0, ind);
		}
		ind = temp.indexOf('$');
		if (ind > 0) {
			temp = temp.substring(0, ind);
		}
		//alert("thisSalePrice="+thisSalePrice+" thisRegPrice="+thisRegPrice)
		if (thisSalePrice == thisRegPrice) {
			temp += "<strong>" + thisRegPrice + "</strong>";
		} else {
			temp += "<span class='strikethrough'><strong><span class='priceLabel'>was </span>" + thisRegPrice + "</strong></span> ";
			temp += "<span class='discount'><strong><span class='priceLabel'>now </span>" + thisSalePrice + "</strong></span>";
		}
		if (YAHOO.ebauer.productUtils.basicMode == true)
			temp += "<br /><span class='itemNumberBasic'>item # " + desCode + "</span>";
		prodLabelObj.innerHTML = temp;
	}
}

function changeAnMPPProductLabel(colorId, prodId, idx, styleIdx) {
	// Get the prices for this style.
	var thisPriceSet = mpColorPrices[idx];
	if (thisPriceSet == null) return;
	// Get the price for this product.
	var thisCurrentPrice = null;
	var thisRegularPrice = null;

	if (colorId != undefined && colorId != "0" && colorId != "null") {
		thisCurrentPrice = thisPriceSet.getCurPriceInfo(prodId, colorId);
		thisRegularPrice = thisPriceSet.getRegPriceInfo(prodId, colorId);
	} else {
		thisCurrentPrice = thisPriceSet.getStylePrice(prodId);
		thisRegularPrice = thisPriceSet.getStylePrice(prodId);
	}
	// Get the label element
	var styleLabel = document.getElementById("price_" + idx + "_" + prodId);
	var itemNumber = getItemNumber(idx, styleIdx);
	// Draw the updated label.
	if (styleLabel != null && thisCurrentPrice != null && thisRegularPrice != null && thisCurrentPrice.length > 0 && thisRegularPrice.length > 0)
		drawAnMPPProductLabel(styleLabel, itemNumber, thisRegularPrice, thisCurrentPrice);
}

function getItemNumber(idx, styleIdx) {
	var result = null;
	var itemNumberId = "itemNumber_" + idx + "_" + styleIdx;
	var itemNumber = document.getElementById(itemNumberId);
	if (itemNumber != null) {
		var itemNumberContent = itemNumber.innerHTML;
		result = "<span class=\"itemNumber\" id=\"" + itemNumberId + "\">" + itemNumberContent + "</span> ";
	}
	return result;
}
function drawAnMPPProductLabel(element, itemNumber, regPrice, curPrice) {
	var newLabel = "";
	// Add the appropriate price info to the label.
	if (regPrice == curPrice) {
		newLabel = "<span class=\"currentPrice\">" + curPrice + "</span> ";
	} else {
		newLabel = "<span class=\"salePrice\">" + curPrice + "</span> " +
					  "<span class=\"regularPrice\">" + regPrice + "</span>";
	}

	// Recover the dept, effort, style part of the label
	if (itemNumber != null) {
		newLabel = newLabel + itemNumber;
	}
	// Update the label
	element.innerHTML = "";
	element.innerHTML = newLabel;
}

function getMPPStyleProdId(idx, styleIdx) {
	var style = document.getElementById("style_" + idx + "_" + styleIdx);
	var result = null;
	if (style != undefined) {
		result = style.value;
	}
	return result;
}


function getSalePrice(colorId) {
	for (var i = 0; i < colorIdArr.length; i++) {
		if (colorIdArr[i] == colorId) {
			return "$" + priceArr[i];
		}
	}
	return regPrice;
}

var onColorChange = new YAHOO.util.CustomEvent("onColorChange");
var onSizeChange = new YAHOO.util.CustomEvent("onSizeChange");
var onColorSizeChange = new YAHOO.util.CustomEvent("onColorSizeChange");
var onHemChange = new YAHOO.util.CustomEvent("onHemChange");
var onInseamChange = new YAHOO.util.CustomEvent("onInseamChange");
var onCopyTextChange = new YAHOO.util.CustomEvent("onCopyTextChange");
onColorChange.subscribe(colorsAreLoaded);
onSizeChange.subscribe(sizesAreLoaded);
onColorSizeChange.subscribe(colorsAreLoaded);


function colorsAreLoaded(type, args) {
	var o = args[0];
	var isMultiProductPage = o.isMPP;
	var length = o.length;
	var selectedIndex = o.selectedIndex;
    //TSK00626: Set the Product Variant ID as either -1 or the selected PV ID. The OrderUtil addItemToCart will figure-out productVariantId from color/size/ensembleId/productId.
    var selectedPvId = (o.selectPvId == undefined?-1:o.selectPvId);
    var xIdx = o.xIdx;
	var colorSel = o.selectObj;
	var colorInventoryStatus = o.invStatus;
    var forceColorChange = (o.forceColorChange == undefined?false:o.forceColorChange);
    var currentlySelectedColor = (o.currentlySelectedColor == undefined?null:o.currentlySelectedColor);
    colorIndex =  selectedIndex;

    colorValue = (forceColorChange?currentlySelectedColor:colorValue);

    if (isMultiProductPage) {
		if (length == 1) {
			colorIndices[xIdx] = '1';
			selectedIndex = 1;
			$("activeSingleColorId_" + xIdx).value = "true";
		}
		colorSel.selectedIndex = selectedIndex;
		colorIndex = selectedIndex;
		YAHOO.ebauer.mppUtil.buttonEnablerMultiSku(colorSel.id);
		// JDR 7/11/07 Added to help synchronize loading of colors and prices.
		mpColorsLoaded[xIdx] = true;

		if (typeof( window[ 'ensembleColorInventoryStatus' ] ) != "undefined") {
			ensembleColorInventoryStatus[xIdx] = colorInventoryStatus;
			setActiveColorSoldout(xIdx);
		}

		// Update the product labels if we have the data to do so!
		if (mpColorPrices != null && mpColorPrices[xIdx] != null && mpColorPrices[xIdx].loaded) {
            if (colorSel.selectedIndex > 0) {
                changeProductLabel(colorSel.options[colorSel.selectedIndex].value, xIdx);
            }
            else  {
                var tempColor = getValueFromElement("defaultColorId");
                changeProductLabel(tempColor, xIdx);
            }
		}
	} else {
        if (getValueFromElement('clearanceCategory') == 'Y') {
            var colorId;
            var sizeId;
            var colorsizeValue;
            var colorsizeArr;
            if (length == 1) {
                colorSel.selectedIndex = 1;
                colorsizeValue = colorSel.value;
                colorsizeArr = colorsizeValue.split('-');
            } else {
                colorsizeValue = currentlySelectedColor;
                colorsizeArr = colorsizeValue.split('-');
            }
            colorId = colorsizeArr[0];
            sizeId = colorsizeArr[1];
            colorsLoaded = true;
            swatchColorSizeSelect(colorId, null, sizeId);
            YAHOO.ebauer.productUtils.toggleAddToButton();
            //TSK00626: Set the Product Variant ID as either -1 or the selected PV ID. The OrderUtil addItemToCart will figure-out productVariantId from color/size/ensembleId/productId.
            var pvIdField = $("productVariantId");
            if( pvIdField != undefined && pvIdField != null) {
                pvIdField.value = selectedPvId;
            }
            //changeProductLabel(colorId);
        } else {
            if (length == 1) {
                colorSel.selectedIndex = 1;
                YAHOO.ebauer.productUtils.availabilityDisplay('size');
                YAHOO.ebauer.productUtils.toggleAddToButton();
                if (!YAHOO.ebauer.productUtils.isSizeUpdatedonInventoryForSingleColor)
                    updateSizes();
                changeProductLabel(colorSel.value);
                YAHOO.ebauer.productUtils.isSizeUpdatedonInventoryForSingleColor = true;
            } else {
                if (colorIndex >= colorSel.options.length || colorSel.options[colorIndex].value != colorValue) {
                    for (var colorSeq = 0; colorSeq < colorSel.options.length; colorSeq++) {
                        if (colorSel.options[colorSeq].value == colorValue) {
                            colorIndex = colorSeq;
                            break;
                        }
                    }
                }

			if ((itemForEditValues != null) && colorIdSelected != -1 && itemForEditValues.item.productid == getProductId() && (colorValue != null && colorIdSelected == colorValue))
				swatchSelect(colorIdSelected);
			else if (forceColorChange && colorValue != null)
				swatchSelect(colorValue);
			if (colorIndex > 0) {
				if (swatchSelection)
					swatchSelection.className = "not";
				if (swatchSelect)
					colorSel.selectedIndex = colorIndex;
				swatchSelection = $("swatch" + colorSel.value);
				if (swatchSelection)
					swatchSelection.className = "hot";
			}
		}
		// Update the product labels if we have the data to do so!
		if (colorPrices != null && colorPrices.loaded) {
			if (colorSel.selectedIndex > 0) {
				changeProductLabel(colorSel.options[colorSel.selectedIndex].value, xIdx);
			} else {
				var tempColor = getValueFromElement("defaultColorId");
				changeProductLabel(tempColor, xIdx);
			}
		}
		colorsLoaded = true;
		// add this check for one sizes check if size or color is sold out and enable the button.
		if (isSoldOut($("size"), colorSel))
			YAHOO.ebauer.productUtils.toggleAddToButton();
	}
}
}

//depricated functions
function buttonEnabler() {
	return;
}
function activateShoppingBag() {
	YAHOO.ebauer.productUtils.toggleAddToButton();
}

function sizesAreLoaded(type, args) {
	var o = args[0];
	var isMultiProductPage = o.isMPP;
	var length = o.length;
	var selectedIndex = o.selectedIndex;
	var xId = o.xIdx;
	var sizeSel = o.selectObj;
	var sizeInventoryStatus = o.invStatus;

	if (isMultiProductPage) {
		//if (length == 1) {

		  $("activeSingleSizeId_" + xId).value = "true";
          sizes.selectedIndex = sizeIndices[xId];
        //}
		if (typeof( window[ 'ensembleSizeInventoryStatus' ] ) != "undefined")
			ensembleSizeInventoryStatus[xId] = sizeInventoryStatus;

		var colVal = $("color_" + xId).value;
		//if (parseInt(colVal) > 1 && sizes.options.length == 2)
		//	selectedIndex = 1;

		//sizes.selectedIndex = selectedIndex;
		YAHOO.ebauer.mppUtil.buttonEnablerMultiSku(sizes.id);

		if (sizes.selectedIndex != 0)
			$("activeSizeId_" + xId).value = sizes.value;

	} else {
		if (length == 1) {
			sizes.selectedIndex = 1;
			YAHOO.ebauer.productUtils.availabilityDisplay('color');
			YAHOO.ebauer.productUtils.toggleAddToButton();
			if (!YAHOO.ebauer.productUtils.isColorUpdatedonInventoryForSingleSize)
				updateColors();
			YAHOO.ebauer.productUtils.isColorUpdatedonInventoryForSingleSize = true;
		} else {
			if (sizeIndex >= sizes.options.length || sizes.options[sizeIndex].value != sizeValue) {
				for (var sizeSeq = 0; sizeSeq < sizes.options.length; sizeSeq++) {
					if (sizes.options[sizeSeq].value == sizeValue) {
						sizeIndex = sizeSeq;
						break;
					}
				}
			}
			if ((itemForEditValues != null) && sizeIdSelected != -1 && itemForEditValues.item.productid == getProductId() && (sizeValue != null && sizeIdSelected == sizeValue)) {
				sizeSel.value = sizeIdSelected;
				if (!YAHOO.ebauer.productUtils.isColorUpdatedforSelectedSize)
					updateColors();
				YAHOO.ebauer.productUtils.isColorUpdatedforSelectedSize = true;
			}
			if (sizeIndex > 0)
				sizes.selectedIndex = sizeIndex;
		}

		if (isSoldOut(sizeSel, $("color")))
			YAHOO.ebauer.productUtils.toggleAddToButton();

		availableInfo(sizes.id);
		ajaxCompleteObject.completeEvent.fire("updateSizesMethod");
		updateCount += 1;
	}
}

function loadCatVals() {
	if ($("ebCM_pCategoryId") != null && $("ebCM_pCategoryId").value != "null")
		YAHOO.ebauer.productUtils.pCategoryId = $("ebCM_pCategoryId").value;
	else
		YAHOO.ebauer.productUtils.pCategoryId = null;
	if ($("ebCM_ggpCategoryId") != null && $("ebCM_ggpCategoryId").value != "null")
		YAHOO.ebauer.productUtils.ggpCategoryId = $("ebCM_ggpCategoryId").value;
	else
		YAHOO.ebauer.productUtils.ggpCategoryId = null;
	if ($("ebCM_gpCategoryId") != null && $("ebCM_gpCategoryId").value != "null")
		YAHOO.ebauer.productUtils.gpCategoryId = $("ebCM_gpCategoryId").value;
	else
		YAHOO.ebauer.productUtils.gpCategoryId = null;
	if ($("ebCM_categoryId") != null && $("ebCM_categoryId").value != "null")
		categoryId = $("ebCM_categoryId").value;
	else
		categoryId = null;
    if ($("ebCM_CATEGORY_INFO") != null && $("ebCM_CATEGORY_INFO").value != "null")
        YAHOO.ebauer.productUtils.cmCategoryInfo = $("ebCM_CATEGORY_INFO").value;
    else
        YAHOO.ebauer.productUtils.cmCategoryInfo = null;
    if ($("ebCM_CATEGORY_PATH") != null && $("ebCM_CATEGORY_PATH").value != "null")
        YAHOO.ebauer.productUtils.cmCategoryPath = $("ebCM_CATEGORY_PATH").value;
    else
        YAHOO.ebauer.productUtils.cmCategoryPath = null;
    if ($("ebCM_PATH_INFO") != null && $("ebCM_PATH_INFO").value != "null")
        YAHOO.ebauer.productUtils.cmPathInfo= $("ebCM_PATH_INFO").value;
    else
        YAHOO.ebauer.productUtils.cmPathInfo= null;


}

function getIconElement(icons){
    var dlElement = createDOM('dl', null);

    for(var count = 0 ; count <icons.length ; count++) {
        var ddElement = createDOM('dd', {'class':icons[count].iconClass});
        if(icons[count].iconImageKey == "") {
            //Create image element
            ddElement.appendChild(createDOM('img', {'src':icons[count].iconImageURL, 'alt':icons[count].iconText}));
        } else {
            //Create text element
            ddElement.innerHTML += icons[count].iconText;
        }
        dlElement.appendChild(ddElement);
    }
    return dlElement;
}
YAHOO.util.Event.onDOMReady(loadCatVals);




