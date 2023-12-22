(self.webpackChunk_metamask_sdk_ui=self.webpackChunk_metamask_sdk_ui||[]).push([[2399],{"./src/design-system/components/Texts/TextWithPrefixIcon/TextWithPrefixIcon.test.tsx":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{var _interopRequireDefault=__webpack_require__("./node_modules/@babel/runtime/helpers/interopRequireDefault.js"),_enzyme=(_interopRequireDefault(__webpack_require__("../devreact/node_modules/react/index.js")),__webpack_require__("./node_modules/enzyme/build/index.js")),_Icon=__webpack_require__("./src/design-system/components/Icons/Icon/index.ts"),_Text=__webpack_require__("./src/design-system/components/Texts/Text/Text.types.ts"),_TextWithPrefixIcon=_interopRequireDefault(__webpack_require__("./src/design-system/components/Texts/TextWithPrefixIcon/TextWithPrefixIcon.tsx")),_TextWithPrefixIcon2=__webpack_require__("./src/design-system/components/Texts/TextWithPrefixIcon/TextWithPrefixIcon.constants.ts"),_jsxRuntime=__webpack_require__("../devreact/node_modules/react/jsx-runtime.js"),sampleIconProps={name:_Icon.IconName.Add};describe("TextWithPrefixIcon - Snapshot",(function(){it("should render default settings correctly",(function(){var wrapper=(0,_enzyme.shallow)((0,_jsxRuntime.jsx)(_TextWithPrefixIcon.default,{variant:_Text.TextVariant.HeadingSMRegular,iconProps:sampleIconProps,children:_TextWithPrefixIcon2.TEST_SAMPLE_TEXT}));expect(wrapper).toMatchSnapshot()}))})),describe("TextWithPrefixIcon",(function(){it("should render TextWithPrefixIcon",(function(){var TextWithPrefixIconComponent=(0,_enzyme.shallow)((0,_jsxRuntime.jsx)(_TextWithPrefixIcon.default,{variant:_Text.TextVariant.HeadingSMRegular,iconProps:sampleIconProps,children:_TextWithPrefixIcon2.TEST_SAMPLE_TEXT})).findWhere((function(node){return node.prop("testID")===_TextWithPrefixIcon2.TEXT_WITH_PREFIX_ICON_TEST_ID}));expect(TextWithPrefixIconComponent.exists()).toBe(!0)})),it("should render the given icon name and size",(function(){var testIconName=_Icon.IconName.Bank,testIconSize=_Icon.IconSize.Xss;sampleIconProps.name=testIconName,sampleIconProps.size=testIconSize;var iconElement=(0,_enzyme.shallow)((0,_jsxRuntime.jsx)(_TextWithPrefixIcon.default,{variant:_Text.TextVariant.HeadingSMRegular,iconProps:sampleIconProps,children:_TextWithPrefixIcon2.TEST_SAMPLE_TEXT})).findWhere((function(node){return node.prop("testID")===_TextWithPrefixIcon2.TEXT_WITH_PREFIX_ICON_ICON_TEST_ID}));expect(iconElement.props().name).toBe(testIconName),expect(iconElement.props().size).toBe(testIconSize)})),it("should render the given text with the appropriate variant",(function(){var testTextVariant=_Text.TextVariant.BodySM,titleElement=(0,_enzyme.shallow)((0,_jsxRuntime.jsx)(_TextWithPrefixIcon.default,{variant:testTextVariant,iconProps:sampleIconProps,children:_TextWithPrefixIcon2.TEST_SAMPLE_TEXT})).findWhere((function(node){return node.prop("testID")===_TextWithPrefixIcon2.TEXT_WITH_PREFIX_ICON_TEXT_TEST_ID}));expect(titleElement.props().children).toBe(_TextWithPrefixIcon2.TEST_SAMPLE_TEXT),expect(titleElement.props().variant).toBe(testTextVariant)}))}))},"?8d7a":()=>{},"?eecd":()=>{}}]);