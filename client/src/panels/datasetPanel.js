import { FormControl } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import React from 'react';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import Select from 'material-ui/Select';
import { withStyles } from 'material-ui/styles';


/**
 * The DatasetPanel component allows the user to control
 * the active dataset and see dataset metadata.
 */
class DatasetPanel extends React.Component {
  /**
   * The DatasetPanel constructor.
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      dataset: '',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * Handles the user changing the current active dataset.
   * @param {Event} event
   */
  handleChange(event) {
    this.setState({ [event.target.name]:event.target.value });
  };

  /**
   * Renders the component to HTML.
   * @return {HTML}
   */
  render() {
    const { classes } = this.props;
    return (
      <Paper style={{ padding:'15px', paddingBottom:'50px' }}>
        <div style={{ display:'flex', flexDirection:'column' }}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor='dataset-field'>Dataset</InputLabel>
            <Select value={this.state.dataset} onChange={this.handleChange}
              inputProps={{
                name: 'dataset',
                id: 'dataset-field',
              }}>
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {
                this.props.datasets.map((dataset) => (
                  <MenuItem value={dataset.name} key={dataset.id}>
                    {dataset.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
      </Paper>
    );
  }
}

// Enforce that Application receives styling.
DatasetPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

// Wrap Application in Styling Container.
export default withStyles({})(DatasetPanel);
