//@flow
import React from "react";
import { ButtonAddons, Button } from "@scm-manager/ui-components";
import type { Repository } from "@scm-manager/ui-types";
import CloneInformation from "./CloneInformation";
import type { Link } from "@scm-manager/ui-types";
import injectSheets from "react-jss";

const styles = {
  protocols: {
    position: "relative"
  },
  switcher: {
    position: "absolute",
    top: 0,
    right: 0
  }
};

type Props = {
  repository: Repository,

  // context props
  classes: Object
}

type State = {
  selected?: Link
};

function selectHttpOrFirst(repository: Repository) {
  const protocols = repository._links["protocol"] || [];

  for (let protocol of protocols) {
    if (protocol.name === "http") {
      return protocol;
    }
  }

  if (protocols.length > 0) {
    return protocols[0];
  }
  return undefined;
}

class ProtocolInformation extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selected: selectHttpOrFirst(props.repository)
    };
  }

  selectProtocol = (protocol: Link) => {
    this.setState({
      selected: protocol
    });
  };

  renderProtocolButton = (protocol: Link) => {
    const name = protocol.name || "unknown";

    let color = null;

    const { selected } = this.state;
    if ( selected && protocol.name === selected.name ) {
      color = "link is-selected";
    }

    return (
      <Button color={ color } action={() => this.selectProtocol(protocol)}>
        {name.toUpperCase()}
      </Button>
    );
  };

  render() {
    const { repository, classes } = this.props;

    const protocols = repository._links["protocol"];
    if (!protocols || protocols.length === 0) {
      return null;
    }

    if (protocols.length === 1) {
      return <CloneInformation url={protocols[0].href} repository={repository} />;
    }

    const { selected } = this.state;
    let cloneInformation = null;
    if (selected) {
      cloneInformation = <CloneInformation repository={repository} url={selected.href} />;
    }

    return (
     <div className={classes.protocols}>
       <ButtonAddons className={classes.switcher}>
         {protocols.map(this.renderProtocolButton)}
       </ButtonAddons>
       { cloneInformation }
     </div>
    );
  }

}

export default injectSheets(styles)(ProtocolInformation);