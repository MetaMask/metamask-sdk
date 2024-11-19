import { h } from '@stencil/core';

const AdvantagesListItem = ({ Icon, text }: { Icon: any; text: string }) => (
  <div class='flexContainer' style={{ padding: '6', flexDirection: 'row'}}>
    <div class='flexItem1'>
      <Icon />
    </div>
    <div class='flexItem11'>
      <span style={{ lineHeight: '2',  color: 'black' }}>{text}</span>
    </div>
  </div>
);

export default AdvantagesListItem;
