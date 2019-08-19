import React from "react";
import { throttle, debounce } from "throttle-debounce";
import Autosuggest from "react-autosuggest";

import { getLocationSuggestions } from "../../api";

export default class LocationInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            query: "",
            value: "",
            suggestions: []
        };

        this.autocompleteSearchDebounced = debounce(
            500,
            this.autocompleteSearch
        );
        this.autocompleteSearchThrottled = throttle(
            500,
            this.autocompleteSearch
        );
    }

    autocompleteSearch = q => {
        this.waitingFor = q;

        getLocationSuggestions(q).then(result => {
            if (q === this.waitingFor) {
                let _suggestions = [];
                let i;
                for (i in result) {
                    _suggestions.push(result[i]);
                }

                this.setState({ suggestions: _suggestions });
            }
        });
    };

    onChange = event => {
        const value = event.target.value;
        this.setState({ query: value, value }, () => {
            const q = this.state.query;
            if (q.length < 5) {
                this.autocompleteSearchThrottled(this.state.query);
            } else {
                this.autocompleteSearchDebounced(this.state.query);
            }
        });
    };

    fetchSuggestions = ({ query }) => {
        this.autocompleteSearch(query);
    };

    clearSuggestions = () => {
        this.setState({
            suggestions: [],
            query: ""
        });
    };

    onSuggestionSelected = (event, { suggestion, suggestionValue }) => {
        this.setState({
            value: suggestionValue,
            query: "",
            suggestions: []
        });

        // Call callback fn with value of selected location
        this.props.onSearchCompleted(suggestion);
    };

    getSuggestionValue = suggestion => {
        return suggestion.name;
    };

    renderSuggestion = suggestion => (
        <span className="suggestion">{suggestion.name}</span>
    );

    componentDidUpdate(prevProps) {
        if (!prevProps.clearInput && this.props.clearInput) {
            this.setState({
                suggestions: [],
                query: "",
                value: ""
            });
            this.props.onInputCleared();
        }
    }

    render() {
        const inputProps = {
            placeholder: "Enter location",
            value: this.state.value,
            onChange: this.onChange
        };
        return (
            <div className="location-input col-8 col-md-6">
                <Autosuggest
                    suggestions={this.state.suggestions || []}
                    onSuggestionSelected={this.onSuggestionSelected}
                    onSuggestionsFetchRequested={this.fetchSuggestions}
                    onSuggestionsClearRequested={this.clearSuggestions}
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                />
            </div>
        );
    }
}
