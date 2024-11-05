import { flavorEntries } from "@catppuccin/palette";

module.exports = function buildCatppuccinThemes(prefix) {
    /**
     * @param {Entries<Readonly<import("@catppuccin/palette").Colors<import("@catppuccin/palette").ColorFormat>>>} colors  
     * @returns {Record<string, Record<string, string>>}
     */
    function mapColors(colors) {
      const mappedColors = {};
      for (const [colorName, { hex, rgb, hsl }] of colors) {
        mappedColors[colorName] = hex;
        // const { r, g, b } = rgb;
        // mappedColors[`${colorName}-rgb`] = `${r} ${g} ${b}`;
        // let { h, s, l } = hsl;
        // s *= 100;
        // l *= 100;
        // h = Math.round(h * 100) / 100;
        // s = Math.round(s * 100) / 100;
        // l = Math.round(l * 100) / 100;
        // mappedColors[`${colorName}-hsl`] = `${h} ${s}% ${l}%`;
      }
      return mappedColors;
    }

    const themes = {};
    flavorEntries.forEach(([_, flavor]) => {
	  let name = prefix + flavor.name.toLowerCase();
	  name = name.replace('é', 'e');
      themes[name] = {
        ...mapColors(flavor.colorEntries),
      };
    });
    return themes;
  }