import Client from './client.js';
import ConnectionDialog from './connectionDialog.js';
import { DSXProvider } from './dsxContext.js';
import DatasetPanel from './panels/datasetPanel.js';
import Drawer from 'material-ui/Drawer';
import ErrorDialog from './errorDialog.js';
import GraphD3Window from './windows/graphD3Window.js';
import GraphGLWindow from './windows/graphGLWindow.js';
import PropTypes from 'prop-types';
import React from 'react';
import TableWindow from './windows/tableWindow.js';
import Toolbar from './toolbar.js';
import Workspace from './workspace.js';
import { withStyles } from 'material-ui/styles';

const drawerWidth = 260;
const styles = (theme) => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    height: 'calc(100vh)',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    overflowX: 'hidden',
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: '#eef',
    position: 'relative',
  },
  workspace: {
    display: 'grid',
    height: 'calc(100vh - 64px)',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    gridGap: '0em',
  },
  toolbar: theme.mixins.toolbar,
});

// TODO: Move QueryParam Configuration to some central
//       location and expand to support more fields.
const queryString = window.location.search.substring(1);
const debug = queryString.split('=')[1] === 'true';

/**
 * The top level dSpaceX client component.
 */
class Application extends React.Component {
  /**
   * Application constructor.
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      connected: false,
      networkActive: false,
      currentDataset: null,
      datasets: [],
    };

    this.connectButtonClicked = this.connectButtonClicked.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.onNetworkActivityStart = this.onNetworkActivityStart.bind(this);
    this.onNetworkActivityEnd = this.onNetworkActivityEnd.bind(this);
    this.onDatasetChange = this.onDatasetChange.bind(this);

    this.client = new Client();
    this.client.addEventListener('connected', this.onConnect);
    this.client.addEventListener('disconnected', this.onDisconnect);
    this.client.addEventListener('networkActive', this.onNetworkActivityStart);
    this.client.addEventListener('networkInactive', this.onNetworkActivityEnd);
    // export client for debugging
    window.client = this.client;
  }

  /**
   * Callback invoked before the component receives new props.
   */
  componentWillMount() {
    console.log('Initializing Application...');
  }

  /**
   * Callback invoked immediately after the component is mounted.
   */
  componentDidMount() {
    console.log('Application Ready.');
  }

  /**
   * Handles the connect button being clicked.
   */
  connectButtonClicked() {
    this.refs.connectiondialog.open();
  }

  /**
   * Handles the application connecting to the remote server.
   */
  onConnect() {
    this.client.fetchDatasetList().then(function(response) {
      this.setState({
        connected: true,
        datasets: response.datasets,
      });
    }.bind(this));
  }

  /**
   * Handles the application disconnecting from the remote server.
   */
  onDisconnect() {
    this.refs.errorDialog.reportError('Unable to communicate with server.');
    this.setState({
      connected: false,
      networkActive: false,
    });
  }

  /**
   * Handles whent he applications starts communicating with the server.
   */
  onNetworkActivityStart() {
    this.setState({
      networkActive: true,
    });
  }

  /**
   * Handles when the applications stops communicating with the server.
   */
  onNetworkActivityEnd() {
    this.setState({
      networkActive: false,
    });
  }

  /**
   * Handles updating dataflow to components when dataset changes.
   * @param {object} dataset
   */
  onDatasetChange(dataset) {
    this.setState({
      currentDataset: dataset,
    });
  }

  /**
   * Renders the component to HTML.
   * @return {HTML}
   */
  render() {
    const { classes } = this.props;
    let drawerMarginColor = this.state.connected ? '#fff' : '#ddd';
    return (
      <DSXProvider value={{ client:this.client }}>
        <div className={classes.root}>
          <Toolbar className={classes.appBar}
            connectedToServer={this.state.connected}
            onConnectClick={this.connectButtonClicked}
            networkActive={this.state.networkActive} />
          <ConnectionDialog ref='connectiondialog' client={this.client}/>
          <Drawer PaperProps={{ elevation:6 }} variant='permanent'
            classes={{ paper:classes.drawerPaper }}>
            { /* Add div to account for menu bar */ }
            <div className={classes.toolbar} />
            <DatasetPanel
              enabled={this.state.connected}
              datasets={this.state.datasets}
              onDatasetChange={this.onDatasetChange}
              onQoiChange={this.onQoiChange}
              client={this.client}/>
            <div style={{
              backgroundColor: drawerMarginColor,
              height: '100%',
              width: '100%',
            }}></div>
          </Drawer>
          <Workspace className={classes.content}>
            { /* Add div to account for menu bar */ }
            <div className={classes.toolbar}/>
            <div className={classes.workspace}>
              {

              }
            </div>
          </Workspace>
          <ErrorDialog ref='errorDialog' />
        </div>
      </DSXProvider>
    );
  }
}

// Enforce that Application receives styling.
Application.propTypes = {
  classes: PropTypes.object.isRequired,
};

// Wrap Application in Styling Container.
export default withStyles(styles)(Application);
