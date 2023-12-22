"use strict";(self.webpackChunk_metamask_sdk_ui=self.webpackChunk_metamask_sdk_ui||[]).push([[2256],{"./src/design-system/components/Banners/Banner/foundation/BannerBase/README.md":module=>{module.exports='# BannerBase\n\nBannerBase serves as a base for all banner variants. It contains  standard props such as information and related actions. \n\n## BannerBase Props\n\nThis component extends React Native\'s [ViewProps](https://reactnative.dev/docs/view) component.\n\n### `variant`\n\nVariant of Banner.\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| [BannerVariant](../../Banner.types.ts)               | No                                                     |\n\n### `startAccessory`\n\nOptional content to be displayed before the info section.\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| React.ReactNode                                           | No                                                     |\n\n### `title`\n\nOptional prop for title of the Banner.\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| string or ReactNode                                   | No                                                     |\n\n### `description`\n\nOptional description below the title.\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| string or ReactNode                                   | No                                                     |\n\n\n### `actionButtonProps`\n\nOptional prop to control the action button\'s props.\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| [ButtonProps](../../../../Buttons/Button/Button.types.ts)                                  | No                                                     |\n\n### `onClose`\n\nOptional function to trigger when pressing the action button.\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| Function                                            | No                                                     |\n\n### `closeButtonProps`\n\nOptional prop to control the close button\'s props.\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| [ButtonIconProps](../../../../Buttons/ButtonIcon/ButtonIcon.types.ts)                                  | No                                                     |\n\n### `children`\n\nOptional prop to add children components to the Banner\n\n| <span style="color:gray;font-size:14px">TYPE</span> | <span style="color:gray;font-size:14px">REQUIRED</span> |\n| :-------------------------------------------------- | :------------------------------------------------------ |\n| React.ReactNode                                     | No                                                     |\n\n## Usage\n\n```javascript\n<BannerBase\n  startAccessory={SAMPLE_BANNERBASE_ACCESSORY}\n  title={SAMPLE_BANNERBASE_TITLE}\n  description={SAMPLE_BANNERBASE_DESCRIPTION}\n  actionButtonProps={{\n    label: SAMPLE_BANNERBASE_ACTIONBUTTONLABEL,\n    onPress: () => {}\n  }}\n  onClose={() => {}}\n>\n  {SAMPLE_ADDITIONAL_ACCESSORY}\n</BannerBase>;\n```\n'}}]);