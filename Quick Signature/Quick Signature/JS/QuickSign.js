// JScript source code
// Constants & Variables
{
    var ImageText = "";
    var signatureImageDataId = "";
    var xrm = window.parent.Xrm;
    var ODATA_URL = xrm.Page.context.prependOrgName('/XRMServices/2011/OrganizationData.svc');
    var ODATA_QUICKSIGNDATA = 'unizap_quicksigndataSet';
    var RecordID = xrm.Page.data.entity.getId();
    var EntityName = xrm.Page.data.entity.getEntityName();
    var HTML5AlertMsg = 'Your Browser does not support HTML5 uploads! Cannot show preview!';
    var FileSizeBigMsg = 'File size is too big!';
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;
}


(function (ns) {

    ns.SignatureControl = function (options) {
        var containerId = options && options.canvasId || "container",
            callback = options && options.callback || {},
            label = options && options.label || "Signature",
            cWidth = options && options.width || "300px",
            cHeight = options && options.height || "300px",
            btnClearId,
            btnAcceptId,
            canvas,
            ctx;

        function initCotnrol() {
            createControlElements();
            wireButtonEvents();
            canvas = document.getElementById("signatureCanvas");
            canvas.addEventListener("mousedown", pointerDown, false);
            canvas.addEventListener("mouseup", pointerUp, false);
            ctx = canvas.getContext("2d");
            RetreiveImageURL();
            var imageObj = new Image();
            imageObj.onload = function () {
                ctx.drawImage(this, 0, 0);
            };

            imageObj.src = ImageText;
        }

        function createControlElements() {
            var signatureArea = document.createElement("div"),
                labelDiv = document.createElement("div"),
                canvasDiv = document.createElement("div"),
                canvasElement = document.createElement("canvas"),
                buttonsContainer = document.createElement("div"),
                buttonClear = document.createElement("button"),
                buttonAccept = document.createElement("button");

            labelDiv.className = "signatureLabel";
            labelDiv.textContent = label;

            canvasElement.id = "signatureCanvas";
            canvasElement.clientWidth = cWidth;
            canvasElement.clientHeight = cHeight;
            canvasElement.style.border = "solid 2px black";

            buttonClear.id = "btnClear";
            buttonClear.textContent = "Clear";

            buttonAccept.id = "btnAccept";
            buttonAccept.textContent = "Accept";

            canvasDiv.appendChild(canvasElement);
            buttonsContainer.appendChild(buttonClear);
            buttonsContainer.appendChild(buttonAccept);

            signatureArea.className = "signatureArea";
            signatureArea.appendChild(labelDiv);
            signatureArea.appendChild(canvasDiv);
            signatureArea.appendChild(buttonsContainer);

            document.getElementById(containerId).appendChild(signatureArea);
        }

        function pointerDown(evt) {
            ctx.beginPath();
            ctx.moveTo(evt.offsetX, evt.offsetY);
            canvas.addEventListener("mousemove", paint, false);
        }

        function pointerUp(evt) {
            canvas.removeEventListener("mousemove", paint);
            paint(evt);
        }

        function paint(evt) {
            ctx.lineTo(evt.offsetX, evt.offsetY);
            ctx.stroke();
        }

        function wireButtonEvents() {

            var btnClear = document.getElementById("btnClear"),
                btnAccept = document.getElementById("btnAccept");
            btnClear.addEventListener("click", function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, false);

            btnAccept.addEventListener("click", function () {
                callback();
            }, false);

        }

        function getSignatureImage() {
            return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        }
        function getImageDataURL() {
            return canvas.toDataURL();
        }
        return {
            init: initCotnrol,
            getSignatureImage: getSignatureImage,
            getImageDataURL: getImageDataURL
        };
    }
})(this.ns = this.ns || {});

function loaded() {
    var signature = new ns.SignatureControl({
        containerId: 'container', callback: function () {
            var ImageText = signature.getImageDataURL();
            //$('#signatureImage').attr('src', ImageText);
            var signatureImageData = new Object();
            signatureImageData.unizap_ImageText = ImageText;
            signatureImageData.unizap_RecordGUID = RecordID;
            signatureImageData.unizap_EntityName = EntityName;
            if (signatureImageDataId == '' || signatureImageDataId == null) {
                CreateRecord(signatureImageData);
            }
            else {
                UpdateRecord(signatureImageDataId, signatureImageData);
            }
        }
    });
    signature.init();
}

function LoadImage() {
    RetreiveImageURL();
    var image = $(divImgPreview);
    if (ImageText != '') {
        image.attr('src', ImageText);
    }
    else {
        image.attr('src', Alt_ImageText);
    }
    image.attr('width', imageWidth);
    image.attr('height', height);
    $(divImage).css('left', imageLeftPosition + 'px');
    ToggleFileSelect();
}

function RetreiveImageURL() {
    var odataUri = ODATA_URL + "/" + ODATA_QUICKSIGNDATA + "?";
    var select = "unizap_ImageText,unizap_quicksigndataId";
    var filter = "unizap_RecordGUID eq '" + RecordID + "' and unizap_EntityName eq '" + EntityName + "'";
    odataUri += "$select = " + select;
    odataUri += "&$filter = " + filter;
    $.ajax({
        async: false,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        url: odataUri,
        beforeSend: function (XMLHttpRequest) {
            //Specifying this header ensures that the results will be returned as JSON.
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },
        success: function (data, textStatus, XmlHttpRequest) {
            if (data.d.results != null && data.d.results.length > 0) {
                ImageText = data.d.results[0].unizap_ImageText;
                QuickSignDataId = data.d.results[0].unizap_quicksigndataId;
            }
        },
        error: function (XmlHttpRequest, textStatus, errorThrown) {
            alert('OData Retrieve Failed: ' + odataUri + " ; Error – " + XmlHttpRequest.responseText);
        }
    });
}

function UpdateRecord(id, entityObject) {
    var jsonEntity = window.JSON.stringify(entityObject);

    //synchronous AJAX function to Update a CRM record using OData

    $.ajax({
        async: true,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        data: jsonEntity,
        url: ODATA_URL + "/" + ODATA_QUICKSIGNDATA + "(guid'" + id + "')",
        beforeSend: function (XMLHttpRequest) {
            //Specifying this header ensures that the results will be returned as JSON.
            XMLHttpRequest.setRequestHeader("Accept", "application/json");

            //Specify the HTTP method MERGE to update just the changes you are submitting.
            XMLHttpRequest.setRequestHeader("X-HTTP-Method", "MERGE");
        },

        success: function (data, textStatus, XmlHttpRequest) {
        },

        error: function (XmlHttpRequest, textStatus, errorThrown) {
            if (XmlHttpRequest && XmlHttpRequest.responseText) {
                alert("Error while updating " + ODATA_QUICKSIGNDATA + " ; Error – " + XmlHttpRequest.responseText);
            }
        }
    });
}

function CreateRecord(entityObject) {
    var jsonEntity = window.JSON.stringify(entityObject);

    //synchronous AJAX function to Update a CRM record using OData

    $.ajax({
        async: true,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        data: jsonEntity,
        url: ODATA_URL + "/" + ODATA_QUICKSIGNDATA,
        beforeSend: function (XMLHttpRequest) {
            //Specifying this header ensures that the results will be returned as JSON.
            XMLHttpRequest.setRequestHeader("Accept", "application/json");
        },

        success: function (data, textStatus, XmlHttpRequest) {
            if (data != null && data.d != null && data.d.unizap_quicksigndataId != null) {
                QuickSignDataId = data.d.unizap_quicksigndataId;
            }
        },

        error: function (XmlHttpRequest, textStatus, errorThrown) {
            if (XmlHttpRequest && XmlHttpRequest.responseText) {
                alert("Error while updating " + ODATA_QUICKSIGNDATA + " ; Error – " + XmlHttpRequest.responseText);
            }
        }
    });
}

window.addEventListener('DOMContentLoaded', loaded, false);