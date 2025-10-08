import { StyleSheet } from 'react-native';

// Color palette
export const colors = {
	// Primary colors
	blue500: '#3B82F6',
	blue600: '#2563EB',
	blue700: '#1D4ED8',

	// Purple colors
	purple50: '#FAF5FF',
	purple600: '#9333EA',
	purple700: '#7E22CE',

	// Gray colors
	gray50: '#F9FAFB',
	gray100: '#F3F4F6',
	gray200: '#E5E7EB',
	gray300: '#D1D5DB',
	gray400: '#9CA3AF',
	gray500: '#6B7280',
	gray600: '#4B5563',
	gray700: '#374151',
	gray800: '#1F2937',

	// Green colors
	green50: '#F0FDF4',
	green100: '#DCFCE7',
	green200: '#BBF7D0',
	green600: '#16A34A',
	green700: '#15803D',
	green800: '#166534',

	// Red colors
	red50: '#FEF2F2',
	red100: '#FEE2E2',
	red200: '#FECACA',
	red600: '#DC2626',
	red700: '#B91C1C',

	// White and black
	white: '#FFFFFF',
	black: '#000000',

	// Slate colors
	slate800: '#1E293B',
};

export const sharedStyles = StyleSheet.create({
	// Container styles
	container: {
		flex: 1,
		backgroundColor: colors.gray50,
	},
	safeArea: {
		flex: 1,
		backgroundColor: colors.gray50,
	},
	scrollContainer: {
		padding: 16,
	},

	// Card styles
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		marginBottom: 16,
		shadowColor: colors.black,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},

	// Text styles
	heading1: {
		fontSize: 28,
		fontWeight: 'bold',
		color: colors.slate800,
		marginBottom: 16,
		textAlign: 'center',
	},
	heading2: {
		fontSize: 20,
		fontWeight: 'bold',
		color: colors.gray800,
		marginBottom: 12,
	},
	heading3: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.gray800,
		marginBottom: 8,
	},
	text: {
		fontSize: 14,
		color: colors.gray700,
	},
	textSmall: {
		fontSize: 12,
		color: colors.gray600,
	},
	textMono: {
		fontFamily: 'monospace',
		fontSize: 12,
	},

	// Button styles
	button: {
		backgroundColor: colors.blue500,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
  buttonCancell: {
		backgroundColor: colors.red600,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		color: colors.white,
		fontSize: 16,
		fontWeight: '500',
	},
	buttonDisabled: {
		backgroundColor: colors.gray300,
	},
	buttonTextDisabled: {
		color: colors.gray500,
	},

	// Input styles
	input: {
		borderWidth: 1,
		borderColor: colors.gray300,
		borderRadius: 6,
		padding: 12,
		fontSize: 14,
		backgroundColor: colors.white,
		color: colors.gray800,
	},
	textArea: {
		borderWidth: 1,
		borderColor: colors.gray300,
		borderRadius: 6,
		padding: 12,
		fontSize: 12,
		backgroundColor: colors.gray50,
		fontFamily: 'monospace',
		minHeight: 200,
		textAlignVertical: 'top',
	},

	// Badge styles
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		alignSelf: 'flex-start',
	},
	badgeText: {
		fontSize: 12,
		fontWeight: '500',
	},
	badgeBlue: {
		backgroundColor: colors.blue500,
	},
	badgeTextBlue: {
		color: colors.blue700,
	},
	badgePurple: {
		backgroundColor: colors.purple50,
	},
	badgeTextPurple: {
		color: colors.purple700,
	},
	badgeGreen: {
		backgroundColor: colors.green100,
	},
	badgeTextGreen: {
		color: colors.green600,
	},
	badgeRed: {
		backgroundColor: colors.red100,
	},
	badgeTextRed: {
		color: colors.red600,
	},

	// Checkbox/Switch styles
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		paddingHorizontal: 8,
		borderRadius: 6,
		marginRight: 8,
		marginBottom: 8,
	},
	checkboxLabel: {
		marginLeft: 8,
		fontSize: 14,
		color: colors.gray700,
	},

	// Layout helpers
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	rowWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	spaceBetween: {
		justifyContent: 'space-between',
	},
	marginBottom: {
		marginBottom: 12,
	},
	marginTop: {
		marginTop: 12,
	},

	// Picker/Select styles
	pickerContainer: {
		borderWidth: 1,
		borderColor: colors.gray300,
		borderRadius: 6,
		backgroundColor: colors.white,
		marginBottom: 12,
	},
	picker: {
		height: 50,
		color: colors.gray800,
	},

	// Collapsible styles
	collapsibleHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: colors.gray50,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	collapsibleHeaderText: {
		fontSize: 14,
		fontWeight: '500',
		color: colors.gray700,
		marginLeft: 8,
	},
	collapsibleContent: {
		padding: 16,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: colors.gray200,
		borderBottomLeftRadius: 6,
		borderBottomRightRadius: 6,
	},

	// Result styles
	resultContainer: {
		marginTop: 12,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: colors.gray200,
		backgroundColor: colors.white,
	},
	resultHeader: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.gray200,
	},
	resultHeaderError: {
		backgroundColor: colors.red50,
	},
	resultContent: {
		padding: 12,
	},
	resultCode: {
		backgroundColor: colors.gray50,
		padding: 12,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	resultCodeText: {
		fontFamily: 'monospace',
		fontSize: 12,
		color: colors.gray800,
	},
	resultCodeTextError: {
		color: colors.red600,
	},
});

