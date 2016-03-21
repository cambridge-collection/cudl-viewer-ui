import CKEDITOR from '../ckeditor';
import $ from 'jquery';
import forEach from 'lodash/forEach';
import assign from 'lodash/assign';

import '../../css/cudl-editor.css';
import editorConfirmation from './editor-confirmation.jade';

$(function() {
    let context = $(document.body).data('context');

    CKEDITOR.config.allowedContent = true;  // prevent tag filtering
    CKEDITOR.disableAutoInline = true;
    //CKEDITOR.config.filebrowserBrowseUrl = '/editor/browse/images';
    CKEDITOR.config.filebrowserImageBrowseUrl = '/editor/browse/images';
    //CKEDITOR.config.filebrowserUploadUrl = '/editor/add/image';
    //CKEDITOR.config.filebrowserImageUploadUrl = '/editor/add/image';

    forEach(context.editableAreas, ({id, filename}) => {

        let el = $('#' + id);
        if(!el.length) {
            throw new Error(`No element exists with id: ${id}`);
        }

        // Mark the element as editable otherwise CKEDITOR will be in read only
        // mode.
        el.attr('contenteditable', 'true');

        CKEDITOR.inline(el[0], assign({}, require('../ckeditor/config'), {
            on: {
                save: function(event) {
                    openConfirmation(filename, event.editor.getData());
                }
             }
         }));
    });

    var saveData = function (filename, data, callback) {
        // Submit data to /editor/update/html
        $.ajax({
            type: "POST",
            url: "/editor/update/html",
            data: { html: data, filename: filename }
        }).done(function( msg ) {
            let isError = !msg.writesuccess;
            callback(isError);
        });
    }

    var openConfirmation = function(filename, data) {
        let confirm = $($.parseHTML(editorConfirmation()));
        let filenameInput =
            confirm.find('input[name=filename]').val(filename);

        confirm.find('.close, .cancel').on('click', () => confirm.remove());
        confirm.find('.btn-success').on('click', () => {
            let selectedFilename = filenameInput.val();
            saveData(selectedFilename, data, (err) => {
                if(err) {
                    alert("Changes Saved.");
                }
                else {
                    alert("There was a problem saving your changes.");
                }
            });
            confirm.remove();
        });

        confirm.appendTo(document.body);
    }
});
