import styles from '../styles';

const AdvantagesListItem = ({ Icon, text }: { Icon: any; text: string }) => (
  <div style={{ padding: 6, ...styles.flexContainer, flexDirection: 'row'}}>
    <div style={styles.flexItem1}>
      <Icon />
    </div>
    <div style={styles.flexItem11}>
      <span style={{ lineHeight: '2',  color: 'black' }}>{text}</span>
    </div>
  </div>
);

export default AdvantagesListItem;
