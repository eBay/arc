# Adaptive Resources & Components (ARC)

ARC uses “flags” and a period delimited naming convention to generate and serve a bundle that contains only the resources used by the requesting environment.

This allows us to build web applications that serve ONLY the code necessary for multiple device types, screen sizes, brands - all from a single codebase.

The flexibility of ARC enables us to only diverge components when necessary, and works for both client and server rendering.

**Use cases include...**
- Different designs for different device sizes
- Javascript functionality only needed for one type of device or context
- Branding & themes: holidays, temporary promotions, different websites using the same components 

**Frameworks supported:**

View the `packages/` directory to see module options that apply to the frameworks you're using.

**Example:**

Given the following files:
```
style.css
style.mobile.css
style.mobile.ios.css
```
You may request `style.css`, but if you have the `mobile` flag set, you will get `style.mobile.css` and if you also had the `ios` flag set you would get `style.mobile.ios.css`.

**Demo app using ARC:**

[Demo](https://github.com/fierysunset/arc-react-webpack-demo)
