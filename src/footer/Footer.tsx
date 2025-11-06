/**
 * Page footer. React component.
 * @returns Component HTML.
 */
function Footer() {
	//render component HTML
	let html =
        <footer className="footer mt-auto py-3 bg-light border-top text-center">
            <div className="container">
        <span className="text-muted">
          © {new Date().getFullYear()} MyRecipes — Lithuania
        </span>
            </div>
        </footer>

	//
	return html;
}

//export component
export default Footer;