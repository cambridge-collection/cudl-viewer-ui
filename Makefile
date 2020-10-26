docker-devserver-image: docker/.viewer-ui-devserver.image-id

docker/.viewer-ui-devserver.image-id: docker/devserver/Dockerfile package.json package-lock.json
	# We can't build the image via docker-compose because compose doesn't
	# support enabling ssh forwarding, which is required to access private repos
	DOCKER_BUILDKIT=1 docker build -t viewer-ui-devserver --ssh default \
		--iidfile docker/.viewer-ui-devserver.image-id \
		--file docker/devserver/Dockerfile .

.PHONY: docker-devserver-image
