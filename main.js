$(document).ready(function () {
  const $form = $("#drag-file-form");
  let droppedFiles = false;
  let $input = $form.find('input[type="file"]'),
    $label = $form.find("label"),
    $errorMsg = $form.find(".box__error"),
    showFiles = function (files) {
      $label.text(
        files.length > 1
          ? ($input.attr("data-multiple-caption") || "").replace(
              "{count}",
              files.length
            )
          : files[0].name
      );
    };

  $form
    .on("drag dragstart dragend dragover dragenter dragleave drop", function (
      e
    ) {
      e.preventDefault();
      e.stopPropagation();
    })
    .on("dragover dragenter", function () {
      $form.addClass("is-dragover");
    })
    .on("dragleave dragend drop", function () {
      $form.removeClass("is-dragover");
    })
    .on("drop", function (e) {
      droppedFiles = e.originalEvent.dataTransfer.files;
      showFiles(droppedFiles);
      $form.removeClass("is-error");
    });
  $input.on("change", function (e) {
    droppedFiles = false;
    showFiles(e.target.files);
    $form.removeClass("is-error");
  });

  $("#button-submit-file").on("click", () => {
    $form.trigger("submit");
  });

  $form.on("submit", function (e) {
    if ($form.hasClass("is-uploading")) return false;

    $form.addClass("is-uploading");
    e.preventDefault();

    var ajaxData = new FormData($form.get(0));

    if (droppedFiles) {
      $.each(droppedFiles, function (i, file) {
        ajaxData.append($input.attr("name"), file);
      });
    }
    ajaxData.append("_token", $form.attr("data-csrf"));

    $.ajax({
      url: $form.attr("action"),
      type: $form.attr("method"),
      data: ajaxData,
      dataType: "json",
      cache: false,
      contentType: false,
      processData: false,
      complete: function () {
        $form.removeClass("is-uploading");
      },
      success: function (data) {
        if (data.success) {
          location.reload();
          return;
        }
        $form.addClass("is-error");
        $errorMsg.text(data.message);
      },
      error: function (error) {
        let message =
          error.status == 422
            ? Object.values(error.responseJSON.errors).flat().join(",")
            : error.responseJSON.message;
        $form.addClass("is-error");
        $errorMsg.text(message);
      },
    });
  });
});
