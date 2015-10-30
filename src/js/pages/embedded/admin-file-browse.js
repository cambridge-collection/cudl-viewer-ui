import '../../../css/admin-file-browse.css';

import path from 'path';

import $ from 'jquery';
import 'fancybox/source/jquery.fancybox.js';

import '../../base.js';
import { getPageContext } from '../../context';


function init() {
    let context = getPageContext();

    let addFileModal = $('#addFile');
    let deleteInfo = $('#deleteInfo');
    let deleteFileModal = $('#deleteFile');

    let fileToDelete;

    $('.fancybox').fancybox();

    $('.btn-add-image').on('click', () => {
        addFileModal.show();
        return false;
    });

    $('.thumbnail a.btn-select').on('click', e => {
        selectFile(getFileInfo(e.currentTarget));
        return false;
    });

    $('.thumbnail a.btn-delete').on('click', e => {
        openDeleteConfirmation(getFileInfo(e.currentTarget));
        return false;
    });

    deleteFileModal.find('.btn-close').on('click', e => {
        fileToDelete = undefined;
        deleteFileModal.hide();
        return false;
    });

    deleteFileModal.find('.btn-delete').on('click', e => {
        deleteSelectedFile();
        return false;
    });

    addFileModal.find('.btn-close').on('click', e => {
        addFileModal.hide();
    });

    function getFileInfo(el) {
        return $(el).parents('.thumbnail').data('file');
    }

    function selectFile(file) {
        window.opener.CKEDITOR.tools.callFunction(
            context.ckEditorFunctionId, file.url);
        window.close();
    }

    function openDeleteConfirmation(file) {
        if(file.type === 'DIRECTORY') {
            deleteInfo.html('<p>Only empty folders can be deleted.</p>');
        }
        else {
            deleteInfo.html('<p>Please make VERY sure this image is not used in any web pages before deleting it.</p>');
        }

        fileToDelete = file;
        deleteFileModal.show();
    }

    function deleteSelectedFile() {
        if(!fileToDelete)
            throw new Error('No file selected');

        let file = fileToDelete;

        let data = {
            filePath: path.join(context.currentDir, fileToDelete.name)
        };

        let jqxhr = $.post('/editor/delete/image', data)
            .done(() => location.reload()) // reload page.
            .fail(() => alert('Unable to delete ' + file.name))
            .always(() => {
                deleteFileModal.hide();
                window.location.reload();
            });
    }

    function validateAddForm() {

        let upload = document.forms.addFileForm.upload.value;

        upload = upload.replace("C:\\fakepath\\", ""); // Chrome and Safari prepend this, so remove it.

        if (!(/^.*\.(jpg|jpeg|png|gif|bmp)$/i).test(upload)) {
            alert("Select an image file with the file extension .jpg .jpeg .bmp .png or .gif");
            return false;
        }

        if (!(/^[-_A-Za-z0-9]+\.(jpg|jpeg|png|gif|bmp)$/i).test(upload)) {
            alert("The image file name must only contain the characters A-Z or 0-9 or - or _ without spaces.");
            return false;
        }

        let dir = document.forms.addFileForm.directory.value;
        if (!/^[-_/A-Za-z0-9]*$/.test(dir)) {
            alert("Folder name must only contain the characters A-Z or 0-9 or / or - or _ without spaces.");
            return false;
        }

        return true;
    }

    $("#addFileForm").submit(function() {
        let url = `/editor/add/image?CKEditor=${encodeURIComponent(context.ckEditor)}&CKEditorFuncNum=${encodeURIComponent(context.ckEditorFunctionId)}&langCode=${encodeURIComponent(context.language)}`;

        if (validateAddForm()) {

            $.ajax({
                type: "POST",
                url: url,
                data: new FormData(this),
                cache: false,
                contentType: false,
                processData: false,
                success: function(data) {
                    window.location.reload(); //reload page.
                }
            });
        }
        return false;
    });
}

$(init);
