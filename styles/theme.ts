import { createTheme } from "@mui/material"

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: React.CSSProperties['color'];
    };
  }

  interface Palette {
    red: Palette['primary'];
    GREEN: Palette['primary'];
    YELLOW: Palette['primary'];
    BLUE: Palette['primary'];
  }

  interface PaletteOptions {
    red: PaletteOptions['primary'];
    GREEN: PaletteOptions['primary'];
    YELLOW: PaletteOptions['primary'];
    BLUE: PaletteOptions['primary'];
  }

  interface PaletteColor {
    darker?: string;
    red?: string
  }

  interface SimplePaletteColorOptions {
    darker?: string;
    red?: string
  }

  interface ThemeOptions {
    status: {
      danger: React.CSSProperties['color'];
    };
  }
}

export const theme = createTheme({
  typography: {
    fontFamily: [
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  status: {
    danger: '#e53e3e',
  },
  palette: {
    primary: {
      main: '#0971f1',
      darker: '#053e85',
      red: '#ec1b30',
    },
    red: {
      main: '#ec1b30',
    },
    GREEN: {
      main: '#00ab4f',
    },
    YELLOW: {
      main: '#ffd401',
    },
    BLUE: {
      main: '#0173bc',
    }
  },
});
