import {h} from "preact"

import styles from "../styles";

const AdvantagesListItem = ({ Icon, text }: {Icon: any, text: String}) => (
  <div style={{ padding: 6, ...styles.flexContainer }}>
    <div style={styles.flexItem1}>
      <Icon />
    </div>
    <div style={styles.flexItem11}>
      <span style={{ lineHeight: "2" }}>{text}</span>
    </div>
  </div>
);

export default AdvantagesListItem;
