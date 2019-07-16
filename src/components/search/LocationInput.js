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

    onSuggestionsFetchRequested = ({ query }) => {
        this.autocompleteSearch(query);
    };

    onSuggestionsClearRequested = () => {
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

    render() {
        const inputProps = {
            placeholder: "Enter a location",
            value: this.state.value,
            onChange: this.onChange
        };
        return (
            <div className="location-input col-md-4">
                <Autosuggest
                    suggestions={this.state.suggestions || []}
                    onSuggestionSelected={this.onSuggestionSelected}
                    onSuggestionsFetchRequested={
                        this.onSuggestionsFetchRequested
                    }
                    onSuggestionsClearRequested={
                        this.onSuggestionsClearRequested
                    }
                    getSuggestionValue={this.getSuggestionValue}
                    renderSuggestion={this.renderSuggestion}
                    inputProps={inputProps}
                />
            </div>
        );
    }
}
