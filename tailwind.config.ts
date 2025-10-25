import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			spacing: {
				'4': '1rem',
				'8': '2rem',
				'12': '3rem',
				'16': '4rem',
				'18': '4.5rem',
				'20': '5rem',
				'24': '6rem',
				'32': '8rem',
				'48': '12rem',
				'64': '16rem',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: {
					DEFAULT: 'hsl(var(--background))',
					secondary: 'hsl(var(--background-secondary))',
					tertiary: 'hsl(var(--background-tertiary))',
				},
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Custom Inner Fire colors
				cream: {
					DEFAULT: 'hsl(var(--cream))',
					dark: 'hsl(var(--cream-dark))',
				},
				coral: 'hsl(var(--coral))',
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					light: 'hsl(var(--gold-light))',
				},
				'warm-orange': 'hsl(var(--warm-orange))',
				'deep-slate': {
					DEFAULT: 'hsl(var(--deep-slate))',
					light: 'hsl(var(--dark-slate-light))',
				},
				'sky-blue': {
					DEFAULT: 'hsl(var(--sky-blue))',
					light: 'hsl(var(--sky-blue-light))',
					dark: 'hsl(var(--sky-blue-dark))',
				},
				text: {
					primary: 'hsl(var(--text-primary))',
					secondary: 'hsl(var(--text-secondary))',
					light: 'hsl(var(--text-light))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: '1rem',
				'2xl': '1.5rem',
				'3xl': '2rem',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'strong': 'var(--shadow-strong)',
				'button': 'var(--shadow-button)',
				'button-hover': 'var(--shadow-button-hover)',
				'glossy': 'var(--shadow-glossy)',
				'3d': 'var(--shadow-3d)',
				'glow': 'var(--shadow-glow)',
				'nav': 'var(--shadow-nav)',
				'orange': 'var(--shadow-orange)',
				'blue': 'var(--shadow-blue)',
				'purple': 'var(--shadow-purple)',
				'green': 'var(--shadow-green)',
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],      // 12px
				'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],   // 14px
				'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],      // 16px
				'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],   // 18px
				'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],    // 20px
				'2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],       // 24px
				'3xl': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],       // 32px
				'4xl': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],   // 36px
				'timer': ['3rem', { lineHeight: '3.5rem', fontWeight: '700' }],     // 48px
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'button-press': {
					'0%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(0.95)'
					},
					'100%': {
						transform: 'scale(1)'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'button-press': 'button-press 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
