build:
	echo "Building PRODUCTION version the viewer-ui and running mvn install"
	rm -rf built
	rm -rf node_modules
	npm install
	webpack --mode production
	mvn clean install

dev:
	echo "Building DEVELOPMENT version of the viewer-ui and starting dev server"
	rm -rf built
	rm -rf node_modules
	npm install
	webpack --mode development
	mvn clean install
	webpack serve --mode development --hot