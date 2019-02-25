import React, { Component } from 'react';
import GalleryPanel from '../panels/galleryPanel';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import grey from '@material-ui/core/es/colors/grey';
import red from '@material-ui/core/es/colors/red';
import { withDSXContext } from '../dsxContext.js';

/**
 *Present all thumbnails and filtering options
 */
class GalleryWindow extends Component {
  /**
   *
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.client = this.props.dsxContext.client;
    this.dataHelper = this.props.dsxContext.dataHelper;
    this.state = {
      thumbnails: [],
      parameters: [],
      qois: [],
      filters: [],
    };

    this.handleImageSelect = this.handleImageSelect.bind(this);
    this.handleAddFilter = this.handleAddFilter.bind(this);
    this.handleUpdateFilter = this.handleUpdateFilter.bind(this);
    this.handleRemoveFilter = this.handleRemoveFilter.bind(this);
  }

  componentWillMount() {
    let { datasetId } = this.props.dataset;

    // Get Thumbnails
    this.client.fetchThumbnails(datasetId)
      .then((result) => {
        const thumbnails = result.thumbnails.map((thumbnail, i) => {
          return {
            img: thumbnail,
            id: i,
            isSelected: false,
          };
        });
        this.setState({ thumbnails });
      });

    // Get Parameters
    this.getParameters().then((parameters) => {
      this.setState({ parameters });
    });

    // Get Qois
    this.getQois().then((qois) => {
      this.setState({ qois });
    });
  }

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

  getVisibleImages() {
    const { numberOfSamples } = this.props.dataset;
    const { filters } = this.state;
    const enabledFilters = filters.filter((f) => f.enabled);

    if (enabledFilters.length === 0) {
      return new Set([...Array(numberOfSamples).keys()]);
    } else {
      let visibleImages = new Set();
      enabledFilters.forEach((f) => {
        if (f.attributeGroup === 'parameters') {
          let params = this.state.parameters.filter((p) => p.parameterName === f.attribute)[0].parameter;
          let visibleParams = params.filter((p) => p >= f.min && p <= f.max);
          visibleParams.forEach((value) => {
            let index = params.findIndex((v) => v === value);
            visibleImages.add(index);
          });
        } else if (f.attributeGroup === 'qois') {
          let qois = this.state.qois.filter((q) => q.qoiName === f.attribute)[0].qoi;
          let visibleQois = qois.filter((q) => q >= f.min && q <= f.max);
          visibleQois.forEach((value) => {
            let index = qois.findIndex((v) => v === value);
            visibleImages.add(index);
          });
        }
      });
      return visibleImages;
    }
  }

  handleImageSelect(id) {
    const thumbnails = [...this.state.thumbnails];
    thumbnails.forEach((thumbnail) => thumbnail.isSelected = false);
    let index = thumbnails.findIndex((thumbnail) => thumbnail.id === id);
    thumbnails[index].isSelected = true;
    this.setState({ thumbnails });
  }

  handleAddFilter(id) {
    let filters = [...this.state.filters];
    const filter = {
      'id': id,
      'enabled': false,
      'min': 0,
      'max': Infinity,
      'attributeGroup': '',
      'attribute': '',
      'numberOfBins': 10,
    };
    filters.push(filter);
    this.setState({ filters });
  }

  handleUpdateFilter(filterConfig) {
    let filters = [...this.state.filters];
    let index = filters.findIndex((f) => f.id === filterConfig.id);
    filters[index] = filterConfig;
    this.setState({ filters });
  }

  handleRemoveFilter(id) {
    let filters = [...this.state.filters];
    filters = filters.filter((f) => f.id !== id);
    this.setState({ filters });
  }

  /**
   *
   * @return {*}
   */
  render() {
    const visibleImages = this.getVisibleImages();
    return (
      <Paper style={{ overflow:'hidden auto' }}>
        <GalleryPanel
          parameters={this.state.parameters}
          qois={this.state.qois}
          filters={this.state.filters}
          addFilter={this.handleAddFilter}
          updateFilter={this.handleUpdateFilter}
          removeFilter={this.handleRemoveFilter}/>
        <Grid container
          justify={'center'}
          spacing={8}
          style={{ margin:'5px 0px 0px 0px' }}>
          {this.state.thumbnails.length > 0
          && this.state.thumbnails.map((thumbnail, i) =>
            visibleImages.has(i) && <Grid key={i} item>
              <Paper
                style={{ backgroundColor:thumbnail.isSelected ? red['700'] : grey['200'] }}>
                <img alt={'Image:' + i} onClick={() => this.handleImageSelect(i)} height='75'
                  style={{ margin:'5px 5px 5px 5px' }}
                  src={'data:image/png;base64, ' + thumbnail.img.rawData}/>
              </Paper>
            </Grid>)}
        </Grid>
      </Paper>
    );
  }
}

export default withDSXContext(GalleryWindow);

