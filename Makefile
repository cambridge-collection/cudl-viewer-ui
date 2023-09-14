build:
	echo "Building the viewer-ui"
	rm -rf built
	rm -rf node_modules
	npm install
	webpack --mode development
	mvn clean install