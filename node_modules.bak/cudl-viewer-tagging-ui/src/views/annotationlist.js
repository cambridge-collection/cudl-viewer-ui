import $ from 'jquery';
import assign from 'lodash/assign';
import escape from 'lodash/escape';
import Spinner from 'spin.js';

import View from './common/view';
import { ICONS } from '../utils/base64icons';
import { NotImplementedError, RuntimeException } from '../utils/exceptions';


export default class AnnotationListView extends View {
    constructor(options) {
        super(assign({
            className: 'panel panel-default annotation-list'
        }, options));

        this.annotationList = options.annotationList;

        $(this.annotationList)
            .on('change:state', this.render.bind(this))
            .on('change:annotations', this._markAnnotationViewsDirty.bind(this))
            .on('delete-failed', (e, status) => this._renderDeleteError(status));

        this._renderInitial();

        this.spinner = new Spinner();
    }

    _bindEvents() {
        $(this.el).on('click.annotationlistview', '.select-all',
                        e => this.onToggleSelectAll(
                            $(e.currentTarget).is(':checked')));

        $(this.el).on('click.annotationlistview', 'button.delete-selected',
                      this.deleteSelected.bind(this));

        $(this.el).on('change:selected.annotationlistview', 'tr',
                      this.onSelectedAnnotationsChanged.bind(this));
    }

    _unbindEvents() {
        $(this.el).off('click.annotationlistview');
        $(this.el).off('change:selected.annotationlistview');
    }

    _createAnnotations() {
        this.annotationViews = this.annotationList.getAnnotations().map(a => {
            return new AnnotationView({annotation: a});
        });
    }

    /** Called when our annotationList model's list of annotations changes */
    _markAnnotationViewsDirty() {
        this.annotationViews = null;
        this._renderClear();
        this._renderAnnotations();
    }

    getAnnotationViews() {
        if(!this.annotationViews) {
            this._createAnnotations();
        }
        return this.annotationViews;
    }

    getSelectedAnnotationViews() {
        return this.getAnnotationViews().filter(v => v.isSelected());
    }

    onToggleSelectAll(isChecked) {
        this.getAnnotationViews().forEach(v => v.setSelected(isChecked));
    }

    setSelectAllState(isChecked) {
        $(this.el).find('.select-all').prop('checked', !!isChecked);
    }

    onSelectedAnnotationsChanged() {
        var button = $(this.el).find('.button-holder');

        var selected = this.getSelectedAnnotationViews().length;

        // Mark the delete button as disabled/enabled
        if(selected === 0) {
            button.animate({ height: 'hide', opacity: 'hide' }, 150);
        }
        else {
            button.animate({ height: 'show', opacity: 'show' }, 150);
        }

        // Update the select all checkbox state
        this.setSelectAllState(selected === this.getAnnotationViews().length);
    }

    deleteSelected() {
        this.annotationList.deleteAnnotations(
            this.getSelectedAnnotationViews().map(v => v.annotation));
    }

    _renderInitial() {
        $(this.el).html(`
            <div class="panel-heading">
                <h3 class="panel-title">
                    Your annotations
                    <small>page ${escape(this.annotationList.getPage())}</small>
                </h3>
            </div>
            <div class="panel-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Value</th>
                            <th>Target</th>
                            <th>Created</th>
                            <th><input type="checkbox" class="select-all"></th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>

                <p class="text-right button-holder" style="display: none;">
                    <button type="button" class="btn btn-danger delete-selected">Delete selected</button>
                </p>

                <div class="messages"></div>

                <div class="loading-indicator"></div>
            </div>
        `);
    }

    _showLoadingIndicator() {
        var indicator = $(this.el).find('.loading-indicator');
        this.spinner.spin(indicator.get(0));
        indicator.show();
    }

    _hideLoadingIndicator() {
        var indicator = $(this.el).find('.loading-indicator');
        this.spinner.stop();
        indicator.hide();
    }

    render() {
        var state = this.annotationList.getState();

        if(state === 'loading') {
            this._renderClear();
            this._showLoadingIndicator();
        }
        if(state === 'idle') {
            this._hideLoadingIndicator();
        }
        else if(state === 'error') {
            this._renderClear();
            this._renderError();
            this._hideLoadingIndicator();
        }
        else if(state === 'deleting') {
            this._showLoadingIndicator();
        }
    }

    _renderClear() {
        $(this.el)
            .find('tbody, .messages')
                .empty()
            .end()
            .find('.button-holder')
                .hide();
        this.setSelectAllState(false);
    }

    _renderDeleteError(status) {
        if(status === 403) {
            this._addMessage(`
                <p class="text-danger">
                    <strong>Unable delete annotations as you've become logged out.</strong>
                    <a href="/auth/login">Log in</a>, then try again.
                </p>
            `);
        }
        else {
            this._addMessage(`
                <p class="text-danger">
                    <strong>Unable to delete annotations.</strong>
                    Please try again shortly.
                </p>
            `);
        }
    }

    _renderError() {
        if(this.annotationList.getErrorStatus() === 403) {
            this._addMessage(`
                <p class="text-danger">
                    <strong>Unable to load annotations as you've become logged out.</strong>
                    <a href="/auth/login">Log in</a>, then try again.
                </p>
            `);
        }
        else {
            this._addMessage(`
                <p class="text-danger">
                    <strong>Unable to load annotations.</strong>
                    Please try again shortly.
                </p>
            `);
        }
    }

    _renderPageNumber() {
        $(this.el).find('.panel-heading h3 small')
            .text(`page ${escape(this.annotationList.getPage())}`);
    }

    _renderAnnotations() {
        this._renderPageNumber()

        this.getAnnotationViews().forEach(av => av.render());
        var annotations = this.getAnnotationViews().map(av => av.el);

        $(this.el)
            .find('tbody')
            .append(annotations)

        if(annotations.length === 0) {
            this._addMessage(`
                <p class="text-muted">
                    You have no annotations on this page
                </p>
            `);
        }
    }

    _addMessage(msg) {
        $(this.el)
            .find('.messages')
            .append(msg);
    }
}


class AnnotationView extends View {
    constructor(options) {
        super(assign({
            tag: 'tr'
        }, options));

        this.annotation = options.annotation;
        this._isSelected;
    }

    _bindEvents() {
        $(this.el).on('change.annotationview', 'input[type=checkbox]',
                      this.onSelectionToggled.bind(this));
    }

    _unbindEvents() {
        $(this.el).off('change.annotationview');
    }

    render() {
        $(this.el)
            .empty()
            .append(
                this._renderType(),
                this._renderValue(),
                this._renderLocation(),
                this._renderDate(),
                '<td><input type="checkbox"></td>'
            );
    }

    onSelectionToggled() {
        this._isSelected = undefined;
        $(this.el).trigger('change:selected', this.isSelected());
    }

    isSelected() {
        if(this._isSelected === undefined) {
            this._isSelected = $(this.el).find('input').is(':checked');
        }
        return this._isSelected;
    }

    setSelected(isSelected) {
        $(this.el).find('input').prop('checked', isSelected);
        this.onSelectionToggled();
    }

    _getFontAwesomeLogo(type) {
        return {
            person: 'fa-user',
            about: 'fa-info-circle',
            date: 'fa-clock-o',
            place: 'fa-map-marker'
        }[type];
    }

    _renderType() {

        return $('<td>')
            .append(
                $('<i>')
                    .addClass('fa fa-lg ' +
                        this._getFontAwesomeLogo(this.annotation.getType()))
                    .attr('alt', this.annotation.getType())
                    .attr('title', this.annotation.getType())
            )
    }

    _renderValue() {
        return $('<td>').text(this.annotation.getName());
    }

    _getLocationType() {
        if(this.annotation.getTarget() === 'doc') {
            return 'Page';
        }
        else if(this.annotation.getTarget() === 'tag') {
            if(this.annotation.getPositionType() === 'point') {
                return 'Point';
            }
            else if(this.annotation.getPositionType() === 'polygon') {
                return 'Region';
            }
        }

        throw new RuntimeException('Unknown annotation location type');
    }

    _renderLocation() {
        return $('<td>').text(this._getLocationType());
    }

    _renderDate() {
        var date = this.annotation.getParsedDate();
        return $('<td>')
            .attr('title', date.format())
            .text(date.fromNow());
    }
}

