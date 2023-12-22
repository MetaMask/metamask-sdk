(self.webpackChunk_metamask_sdk_ui=self.webpackChunk_metamask_sdk_ui||[]).push([[274],{"./src/design-system/components/Banners/Banner/Banner.test.tsx":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{var _interopRequireDefault=__webpack_require__("./node_modules/@babel/runtime/helpers/interopRequireDefault.js"),_asyncToGenerator2=_interopRequireDefault(__webpack_require__("./node_modules/@babel/runtime/helpers/asyncToGenerator.js")),_reactNative=(_interopRequireDefault(__webpack_require__("../devreact/node_modules/react/index.js")),__webpack_require__("./node_modules/@testing-library/react-native/build/index.js")),_Banner=_interopRequireDefault(__webpack_require__("./src/design-system/components/Banners/Banner/Banner.tsx")),_Text=_interopRequireDefault(__webpack_require__("./src/design-system/components/Texts/Text/Text.tsx")),_BannerAlert=__webpack_require__("./src/design-system/components/Banners/Banner/variants/BannerAlert/BannerAlert.types.ts"),_Banner2=__webpack_require__("./src/design-system/components/Banners/Banner/Banner.types.ts"),_Button=__webpack_require__("./src/design-system/components/Buttons/Button/index.ts"),_Icon=__webpack_require__("./src/design-system/components/Icons/Icon/index.ts"),_ButtonIcon=__webpack_require__("./src/design-system/components/Buttons/ButtonIcon/index.ts"),_BannerBase=__webpack_require__("./src/design-system/components/Banners/Banner/foundation/BannerBase/BannerBase.constants.tsx"),_jsxRuntime=__webpack_require__("../devreact/node_modules/react/jsx-runtime.js");describe("Banner",(function(){it("should render correctly",(function(){var wrapper=(0,_reactNative.render)((0,_jsxRuntime.jsx)(_Banner.default,{severity:_BannerAlert.BannerAlertSeverity.Error,variant:_Banner2.BannerVariant.Alert,title:"Hello Error Banner World",description:"This is nothing but a test of the emergency broadcast system."}));expect(wrapper).toMatchSnapshot()})),it("should render correctly with a start accessory",(0,_asyncToGenerator2.default)((function*(){var wrapper=(0,_reactNative.render)((0,_jsxRuntime.jsx)(_Banner.default,{severity:_BannerAlert.BannerAlertSeverity.Error,variant:_Banner2.BannerVariant.Alert,title:"Hello Error Banner World",description:"This is nothing but a test of the emergency broadcast system.",startAccessory:(0,_jsxRuntime.jsx)(_Text.default,{children:"Test Start accessory"})}));expect(wrapper).toMatchSnapshot(),expect(yield wrapper.findByText("Test Start accessory")).toBeDefined()}))),it("should render correctly with an action button",(0,_asyncToGenerator2.default)((function*(){var wrapper=(0,_reactNative.render)((0,_jsxRuntime.jsx)(_Banner.default,{severity:_BannerAlert.BannerAlertSeverity.Error,variant:_Banner2.BannerVariant.Alert,title:"Hello Error Banner World",description:"This is nothing but a test of the emergency broadcast system.",actionButtonProps:{label:"Test Action Button",onPress:function onPress(){return jest.fn()},variant:_Button.ButtonVariants.Secondary}}));expect(wrapper).toMatchSnapshot(),expect(yield wrapper.findByText("Test Action Button")).toBeDefined()}))),it("should render correctly with a close button",(0,_asyncToGenerator2.default)((function*(){var wrapper=(0,_reactNative.render)((0,_jsxRuntime.jsx)(_Banner.default,{severity:_BannerAlert.BannerAlertSeverity.Error,variant:_Banner2.BannerVariant.Alert,title:"Hello Error Banner World",description:"This is nothing but a test of the emergency broadcast system.",actionButtonProps:{label:"Test Action Button",onPress:function onPress(){return jest.fn()},variant:_Button.ButtonVariants.Secondary},closeButtonProps:{onPress:function onPress(){return jest.fn()},iconName:_Icon.IconName.Close,variant:_ButtonIcon.ButtonIconVariants.Primary,size:_ButtonIcon.ButtonIconSizes.Sm}}));expect(wrapper).toMatchSnapshot(),expect(yield wrapper.findByText("Test Action Button")).toBeDefined(),expect(yield wrapper.queryByTestId(_BannerBase.TESTID_BANNER_CLOSE_BUTTON_ICON)).toBeDefined()})))}))}}]);