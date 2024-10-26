import { flavors } from "@catppuccin/palette";
import { getTheme } from "../../theme";

/**
 * 
 * @returns {import("@catppuccin/palette").CatppuccinColors}
 */
export function getColors()
{
	return (flavors[getTheme().split('-').pop()].colors);
}

export function getCatppuccinWEBGL(colorName)
{
	const colors = getColors();

	if (colors[colorName])
	{
		const color = colors[colorName].rgb;
		return	{
				r: color.r / 255, 
				g: color.g / 255,
				b: color.b / 255,
				}
	}
	else
		console.warn("Warning: " + colorName + " is not a valid color");
	return	{
			r: 0, 
			g: 0,
			b: 0,
			}
}

export function getCatppuccinRGB(colorName)
{
	const colors = getColors();

	if (colors[colorName])
	{
		const color = colors[colorName].rgb;
		return [color.r, color.g, color.b];
	}
	else
		console.warn("Warning: " + colorName + " is not a valid color");
	return [0, 0, 0];
}