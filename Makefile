.PHONY: build dev dev-prepare dev-preflight release

MVN ?= mvn
NPM ?= npm

DEPENDENCY_STAMP = node_modules/.cudl-dev-dependencies
FRONTEND_MAVEN_SKIP = -Dskip.installnodenpm=true -Dskip.npm=true -Dskip.webpack=true

build:
	echo "Building PRODUCTION version the viewer-ui and running mvn install"
	rm -rf built
	rm -rf node_modules
	npm install
	webpack --mode production
	mvn clean install

dev: dev-prepare
	$(NPM) start

dev-prepare: dev-preflight $(DEPENDENCY_STAMP)
	echo "Building DEVELOPMENT version of the viewer-ui and installing Maven artefact"
	rm -rf built
	$(NPM) run build -- --mode development
	$(MVN) install $(FRONTEND_MAVEN_SKIP)

dev-preflight:
	./scripts/check-dev-prerequisites.sh

$(DEPENDENCY_STAMP): package.json package-lock.json
	$(NPM) ci
	touch $(DEPENDENCY_STAMP)

release:
	make build && \
	git add -f built && \
	(git diff-index --quiet HEAD ||	git commit -m "Temporarily adding resources for build") && \
	mvn release:prepare && \
	git push --tags && \
	mvn release:perform && \
 	git rm -r --cached built && \
	(git diff-index --quiet HEAD ||	git commit -m "Removing resources for build") ;
