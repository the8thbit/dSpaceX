import * as d3 from 'd3';
import PropTypes from 'prop-types';
import React from 'react';
import { withDSXContext } from '../dsxContext.js';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  root: {
    overflowX: 'auto',
  },
  svgContainer: {
    'display': 'inline-block',
    'position': 'relative',
    'width': '100%',
    'verticalAlign': 'top',
    'overflow': 'hidden',
  },
  svgContent: {
    'display': 'inline-block',
    'position': 'absolute',
    'top': 0,
    'left': 0,
    'fontSize': '0.75em',
    'fontFamily': '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});


/**
 * This class provides the functionality for the d3 scatter plot.
 * Currently only works for Ellipse example data set.
 */
class ScatterPlotWindow extends React.Component {
  /**
   * Create Scatter Plot Window object
   * @param {object} props - properties
   */
  constructor(props) {
    super(props);

    this.client = this.props.dsxContext.client;

    this.svgWidth = 1000;
    this.svgHeight = 600;

    this.state = {
      parameters: [],
      qois: [],
    };

    this.getParameters = this.getParameters.bind(this);
    this.getQois = this.getQois.bind(this);
    this.drawChart = this.drawChart.bind(this);
    this.areAxesSet = this.areAxesSet.bind(this);
    this.getData = this.getData.bind(this);
    this.combineData = this.combineData.bind(this);
  }

  /**
   * Called before componenet mounts by React
   */
  componentWillMount() {
    this.getParameters().then((data) => {
      this.setState({ parameters:data } );
    });
    this.getQois().then((data) => {
      this.setState({ qois:data } );
    });
    if (this.areAxesSet()) {
      this.drawChart();
    }
  }

  /**
   * Called when there has been an update to the
   * React component
   * @param {object} prevProps
   * @param {object} prevState
   * @param {object} prevContext
   */
  componentDidUpdate(prevProps, prevState, prevContext) {
    if (this.areAxesSet()) {
      this.drawChart();
    }
  }

  /**
   * This gets the parameters for the dataset
   * @return {Promise<Array<number>>}
   */
  async getParameters() {
    const { datasetId, parameterNames } = this.props.dataset;
    let parameters = [];
    parameterNames.forEach(async (parameterName) => {
      let parameter =
        await this.client.fetchParameter(datasetId, parameterName);
      parameters.push(parameter);
    });
    return parameters;
  }

  /**
   * This get the QOIs for the dataset
   * @return {Promise<Array<number>>}
   */
  async getQois() {
    const { datasetId, qoiNames } = this.props.dataset;
    let qois = [];
    qoiNames.forEach(async (qoiName) => {
      let qoi =
        await this.client.fetchQoi(datasetId, qoiName);
      qois.push(qoi);
    });
    return qois;
  }

  /**
   * Verify x and y axes values are set
   * @return {boolean} - True if X and Y attribute group and attribute have been set
   */
  areAxesSet() {
    const { xAttributeGroup, xAttribute, yAttributeGroup, yAttribute } = this.props.config;
    if (xAttributeGroup === undefined) {
      return false;
    }
    if (xAttribute === undefined) {
      return false;
    }
    if (yAttributeGroup === undefined) {
      return false;
    }
    return yAttribute !== undefined;
  }

  /**
   * Verify marker values are set
   * @return {boolean} true if the marker attribute group and attribute are set
   */
  areMarkersSet() {
    const { markerAttributeGroup, markerAttribute } = this.props.config;
    if (markerAttributeGroup === undefined) {
      return false;
    }
    return markerAttribute !== undefined;
  }

  /**
   * Returns a single array of the data for an attribute group and attribute
   * @param {string} attributeGroup
   * @param {string} attribute
   * @return {Array<String>}
   */
  getData(attributeGroup, attribute) {
    if (attributeGroup === 'parameters') {
      return this.state.parameters.filter((p) => p.parameterName === attribute)[0].parameter;
    } else {
      return this.state.qois.filter((q) => q.qoiName === attribute)[0].qoi;
    }
  }

  /**
   * Combines data into list of object usable by drawChart
   * @param {Array<number>} x
   * @param {Array<number>} y
   * @param {Array<number>} marker - if undefined only x and y combined
   * @return {Array<object>}
   */
  combineData(x, y, marker) {
    const { numberOfSamples } = this.props.dataset;
    let combinedData = [];
    if (marker === undefined) {
      for (let i = 0; i < numberOfSamples; ++i) {
        combinedData.push({ 'id':i, 'x':x[i], 'y':y[i] });
      }
    } else {
      for (let i = 0; i < numberOfSamples; ++i) {
        combinedData.push({ 'id':i, 'x':x[i], 'y':y[i], 'marker':marker[i] });
      }
    }
    return combinedData;
  }

  /**
   * Draws the scatter plot in rendered svg
   */
  drawChart() {
    // Get the node for the svg
    const node = this.node;
    d3.select(node).selectAll('*').remove();

    // Get necessary props and data
    const { selectedDesigns } = this.props;
    const { xAttributeGroup, xAttribute, yAttributeGroup, yAttribute,
      markerAttributeGroup, markerAttribute } = this.props.config;

    const xValues = this.getData(xAttributeGroup, xAttribute);
    const yValues = this.getData(yAttributeGroup, yAttribute);
    let markerValues = [];
    if (this.areMarkersSet()) {
      markerValues = this.getData(markerAttributeGroup, markerAttribute);
    }

    // Create margins
    let margin = { top:50, right:50, bottom:50, left:50 };
    let chartWidth = this.svgWidth - margin.left - margin.right;
    let chartHeight = this.svgHeight - margin.top - margin.bottom;

    // Create scales
    let xScale = d3.scaleLinear()
      .range([0, chartWidth])
      .domain([d3.min(xValues), d3.max(xValues)])
      .nice();

    let yScale = d3.scaleLinear()
      .range([chartHeight, 0])
      .domain([d3.min(yValues), d3.max(yValues)])
      .nice();

    // Add axes to chart
    let xAxis = d3.axisBottom(xScale);
    d3.select(node)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + (chartHeight + margin.top) + ')')
      .call(xAxis);

    let yAxis = d3.axisLeft(yScale);
    d3.select(node)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
      .call(yAxis);

    // Add Labels to chart
    d3.select(node).append('text')
      .attr('x', (chartHeight / 2 + margin.top + margin.bottom))
      .attr('y', -1 * (175))
      .attr('transform', 'rotate(-90,' + chartWidth / 2 + ',' + chartHeight / 2 + ')')
      .text(yAttribute);

    d3.select(node).append('text')
      .attr('x', (chartWidth / 2 + margin.left + margin.right))
      .attr('y', (chartHeight + margin.top + 30))
      .attr('text-anchor', 'end')
      .text(xAttribute);

    // Add markers - will be different depending on if the attribute group and attribute are
    // set for these.
    if (markerValues.length > 0) {
      let cScale = d3.scalePow().exponent(0.5)
        .domain([d3.min(markerValues), d3.max(markerValues)])
        .range([2.5, 10]);

      let chartData = this.combineData(xValues, yValues, markerValues);
      let circles = d3.select(node).append('g')
        .selectAll('circle')
        .data(chartData);
      let circlesEntering = circles.enter().append('circle');
      circles.exit().remove();
      circles = circles.merge(circlesEntering);
      circles
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('transform', 'translate(' + margin.left + ',' + margin.bottom + ')')
        .attr('r', (d) => cScale(d.marker))
        .attr('fill', (d) => selectedDesigns.has(d.id) ? '#ff3d00' : '#3f51b5')
        .attr('fill-opacity', '0.75')
        .attr('stroke', 'black')
        .on('click', (d) => this.props.onDesignSelection(d3.event, d.id));
    } else {
      const chartData = this.combineData(xValues, yValues, undefined);
      let circles = d3.select(node).append('g')
        .selectAll('circle')
        .data(chartData);
      let circlesEntering = circles.enter().append('circle');
      circles.exit().remove();
      circles = circles.merge(circlesEntering);
      circles
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('transform', 'translate(' + margin.left + ',' + margin.bottom + ')')
        .attr('r', 2.5)
        .attr('fill', (d) => selectedDesigns.has(d.id) ? '#ff3d00' : '#3f51b5')
        .attr('stroke', 'black')
        .on('click', (d) => this.props.onDesignSelection(d3.event, d.id));
    }
  }

  /**
   * Renders the svg to the view
   * @return {JSX}
   */
  render() {
    const { classes } = this.props;
    return (<div className={classes.svgContainer}>
      <svg ref={(node) => this.node = node}
        className={classes.svgContent}
        viewBox={'0 0 '+ this.svgWidth +' '+ this.svgHeight}
        preserveAspectRatio='xMidYMid meet'/>
    </div>);
  }
}

ScatterPlotWindow.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withDSXContext(withStyles(styles)(ScatterPlotWindow));
