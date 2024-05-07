// Check for the various File API support.
if (!(window.File && window.FileReader && window.FileList && window.Blob && Array.prototype.indexOf)) {
    alert("Your browser does not support all features that are needed in this assignment!\nPlease use another browser, e.g. Google Chrome.");
    throw("Your browser does not support all features that are needed in this assignment!\nPlease use another browser, e.g. Google Chrome.");
}

// Currently selected basic operation
var currentBasicOp = "no-op";

// Currently selected base layer operation
var currentBaseLayerOp = "no-op";

// Currently selected shade layer operation
var currentShadeLayerOp = "no-op";

// Currently selected outline layer operation
var currentOutlineLayerOp = "no-op";

let customMatrix = [];

let colorChannelOp = "gray";
// Event handler for the 'click' event of the tabs
// The main goal of this handler is to improve the user experience by adding
// the behaviour of switching tab when the tab is clicked, in additional to
// the default behaviour which switch the tab only when the drop down menu
// items are clicked
function showTab(e) {
    // The target is the 'tab', i.e. the <li>. But most of the time the event
    // is triggered from the <a> inside it, due to the area occupied is much
    // bigger and hence easier to be clicked. So we need to adjust the 'target'
    // if it is not what we want.
    var target = $(e.target);

    // Check if 'target' is actually a <li> element. If not, we need to
    // find the <li> that is a parent of the current selected element.
    if (target.prop("tagName") !== "LI") {
        target = target.parents("li");
    }

    // Find the drop down menu item of this tab that is currently selected
    switch (target.attr("id")) {
        case "basic-dropdown":
            target = target.find("ul li a[href='#" + currentBasicOp + "']");
            break;
        // case "base-dropdown":
        //     target = target.find("ul li a[href='#" + currentBaseLayerOp + "']");
        //     break;
        case "shade-dropdown":
            target = target.find("ul li a[href='#" + currentShadeLayerOp + "']");
            break;
        // case "outline-dropdown":
        //     target = target.find("ul li a[href='#" + currentOutlineLayerOp + "']");
        //     break;
    }

    // Show the tab and make the tab active
    target.trigger('click');
}

// Event handler for the 'click' event of the tab dropdown items.
// This event handler is executed when a dropdown item is clicked on.
function changeTabs(e) {
    // The target is the drop down menu item of the tab
    var target = $(e.target);

    // Check if 'target' is actually an <a> element. If not, we need to
    // find the <a> that is a parent of the current selected element.
    if (target.prop("tagName") !== "A") {
        target = target.parents("a");
    }

    // Show the tab and make the tab active
    target.tab('show');
    target.toggleClass("active");
    target.parents(".nav-item").find(".nav-link").toggleClass("active");

    // Change the tab title to relect which waveform is selected
    target.parents("li").find("span.title").html(target.html());

    // Change the current operation in different tab
    switch (target.parents("li.dropdown").attr("id")) {
        case "basic-dropdown":
            currentBasicOp = target.attr("href").substring(1);
            break;
        case "base-dropdown":
            currentBaseLayerOp = target.attr("href").substring(1);
            break;
        case "shade-dropdown":
            currentShadeLayerOp = target.attr("href").substring(1);
            break;
        case "outline-dropdown":
            currentOutlineLayerOp = target.attr("href").substring(1);
            break;
    }

    e.preventDefault();
}

// Set up every things when the document is fully loaded
$(document).ready(function() {
    // Initialize the imageproc module.
    // Get ready for the canvas area and automatically load the input image
    imageproc.init("input", "output", "input-image");

    // Update the input image when the selection is changed
    $("#input-image").on("change", function() { imageproc.updateInputImage(); });

    
     // Toggle between single and multiple output views
     $("#toggle-view").click(function() {
        if ($("#multiple-outputs").is(":visible")) {
            $("#multiple-outputs").hide();
            $("#multiple-button").hide();
            $("#output").show();
            $("#output-update").show();  // Show the main update button when single output is visible
        } else {
            $("#output").hide();
            $("#multiple-button").show();
            $("#multiple-outputs").show();
            $("#output-update").hide();  // Hide the main update button when multiple outputs are visible
        }
    });

    // Update button to apply all image processing functions
    $("#output-update").on("click", function() { imageproc.apply("output"); });
    // Update individual outputs in multiple view
    $("#output-update-1").click(function() { imageproc.apply("output1"); });
    $("#output-update-2").click(function() { imageproc.apply("output2"); });
    $("#output-update-3").click(function() { imageproc.apply("output3"); });
    $("#output-update-4").click(function() { imageproc.apply("output4"); });
    // Enable Bootstrap Toggle
    $("input[type=checkbox]").bootstrapToggle();

    // Set up the event handlers
    $('a.nav-link').on("click", showTab); // Tab clicked
    $('a.dropdown-item').on("click", changeTabs); // Tab item clicked

    // Initially hide the color system selection dropdown
    $('#color-system-selection').parent().hide();
        
    // Function to toggle the visibility based on the color channel selection
    $('#color-channel').on('change', function() {
        if ($(this).val() == 'individualColor') {
            // Show the color system selection dropdown
            colorChannelOp = $("#color-system-selection").val();
            $('#color-system-selection').parent().show();
        } else {
            // Hide the color system selection dropdown
            $('#color-system-selection').parent().hide();
        }
    });

    $('#dither-method').change(function() {
        if ($(this).val() == "Customized") {
            $('#custom-dither-controls').show();
        } else {
            $('#custom-dither-controls').hide();
            $('#custom-dither-matrix').empty();
        }
    });
    // Update the click event handler for generating the custom matrix
    $('#generate-matrix').click(function() {
        const cols = parseInt($('#cols').val());
        const rows = parseInt($('#rows').val());
        const container = $('#custom-dither-matrix');
        container.empty(); // Clear previous entries

        if (isNaN(cols) || isNaN(rows) || cols < 1 || rows < 1 || cols > 15 || rows > 15) {
            $('#error-message').text('Please enter column and row numbers between 1 and 15.').show();
            return;
        }
        customMatrix = []; // Reset custom matrix
        for (let r = 0; r < rows; r++) {
            const rowValues = [];
            const row = $('<div class="row custom-row justify-content-start"></div>');
            for (let c = 0; c < cols; c++) {
                const inputField = $('<input type="text" class="form-control dither-input-box">');
                if (r === 0 && c === 0) {
                    inputField.val('0').prop('readonly', true); // Set first entry to 0 and make it readonly
                }
                rowValues.push(inputField.val()); // Store input field value
                row.append('<div class="col-auto px-1"></div>').append(inputField);
            }
            customMatrix.push(rowValues); // Store row values in custom matrix
            container.append(row);
        }
        $('#custom-dither-submit').show();
    });

    // // Update the click event handler for generating the custom matrix
    // $('#generate-matrix').click(function() {
    //     const cols = parseInt($('#cols').val());
    //     const rows = parseInt($('#rows').val());
    //     const container = $('#custom-dither-matrix');
    //     container.empty(); // Clear previous entries

    //     if (isNaN(cols) || isNaN(rows) || cols < 1 || rows < 1 || cols > 15 || rows > 15) {
    //         $('#error-message').text('Please enter column and row numbers between 1 and 15.').show();
    //         return;
    //     }
    //     customMatrix = []; // Reset custom matrix
    //     for (let r = 0; r < rows; r++) {
    //         const rowValues = [];
    //         const row = $('<div class="row custom-row justify-content-start"></div>');
    //         for (let c = 0; c < cols; c++) {
    //             const inputField = $('<input type="text" class="form-control dither-input-box">');
    //             row.append('<div class="col-auto px-1"></div>').append(inputField);
    //         }
    //         container.append(row);
    //     }
    //     $('#custom-dither-submit').show();
    // });

    // Update the event handler for submitting the custom matrix
    $('#custom-dither-submit').click(function() {
        // Reset custom matrix
        customMatrix = [];
        // Iterate over each row
        $('.custom-row').each(function() {
            const rowValues = [];
            // Iterate over input fields in the row
            $(this).find('.dither-input-box').each(function() {
                rowValues.push($(this).val()); // Store input field value
            });
            customMatrix.push(rowValues); // Store row values in custom matrix
        });
        console.log("Custom matrix:", customMatrix);
    });
});

// for the custom image upload
function loadImage() {
    const input = document.getElementById('upload-image');
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.getElementById('input');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select a file to upload.");
    }
}

// Update file input label after file selection
document.getElementById('upload-image').addEventListener('change', function(e) {
    const fileName = e.target.files[0].name;
    const nextSibling = e.target.nextElementSibling;
    nextSibling.innerText = fileName;
});