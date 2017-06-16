const Component = require('react').Component;
const PropTypes = require('prop-types');

class FlagProvider extends Component {
	getChildContext() {
		return {
			flags: this.props.flags
		}
	}
	render() {
		return this.props.children;
	}
}

FlagProvider.childContextTypes = {
	flags: PropTypes.array
};

exports.FlagProvider = FlagProvider;