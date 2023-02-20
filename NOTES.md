# Notes

Following along the full cycle docker course.

## Class 1: Hello World
Running the first container with latest tag (ommited) from dockerhub (registry):
`docker run hello-world`

## Class 2: Interactive Container
Attaching the container process to the current terminal and removing it once process stops:
`docker run -i -t --rm ubuntu bash`

Listing all running container:
`docker ps`

Listing all containers:
`docker ps -a`

Restarting a container:
`docker start <container-name>`

## Class 3: Use nginx and Expose ports
Start container:
`docker run nginx`

Need to connect (redirect) the local machine host port to the exposed container port to access it without being explicitly on container network:
`docker run -p 8080:80 nginx`
Access `localhost:8080` on browser and nginx should be displayed

Run the container in background:
`docker run -p 8080:80 nginx`

## Class 4: Removing containers
Stopping container:
`docker stop <container-id>`

Removing containers:
`docker rm <container-id>`
`docker rm -f <container-id>`

## Class 5: Changing files from a container
Naming the container manually:
`docker run -d -p 8080:80 --name nginx nginx`

Entering in the nginx container already running:
`docker exec -it nginx bash`

Default folder of nginx inside de container:
`cd /usr/share/nginx/html`

Install vim:
`apt-get update`
`apt-get install vim`

Edit nginx file:
`vim index.html`
entering insert mode: `i` -> edit -> `esc` -> `:w` -> `q`

The change in the container is lost if the container restarts. For permanent changes, the image should be edited.

## Class 6: Creating a bind mount
Prevent the changes in the container from being lost if container stops with a bind mount.
Create a file in the local machine index.html.

Bind the mount on the container on /usr/share/nginx/html:
`docker run -d -p 8080:80 --name nginx -v <local-directory-with-file>:/usr/share/nginx/html nginx`
Since the file on local machine has the same name as the file in the container (index.html), the latter gets overwritten by the former on bind mount.
If any change is done to the files inside the volume mounted, this change is persisted even if container restarts.

The mount may also be done with --mount flag:
`docker run -d -p 8080:80 --name nginx --mount type=bind,source="$(pwd)"/<directory>,target=/usr/share/nginx/html nginx`

Difference between -v and --mount: -v create binded folders on local machine if they don't exist.

## Class 7: Volumes
See docker volumes:
`docker volume ls`

Volumes will be managed by the docker daemon, so no need to worry about the local directories mapped.
Create a volume:
`docker volume create myvolume`

Inspect volume:
`docker volume inspect myvolume`

Map the volume to a directory in a container:
`docker run --name nginx -d --mount type=volume,source=myvolume,target=/app nginx`

or:
`docker run --name nginx -d -v myvolume:/app nginx`

Now every file created on `/app` inside the container will be persisted in the local machine on the volume.
The same volume can even be shared by more than one container at the same time.

Remove docker volumes not used anymore:
`docker volume prune -f`

## Class 8: Images
An image may have multiple tags. Dockerhub is the default registry. It's possible to provision your own registry.

Download image locally:
`docker pull <image-name>:<image-tag>`

See downloaded images locally:
`docker images`

Remove a downloaded image:
`docker rmi <image-name>:<image-tag>`

## Class 9: Creating an image
See Dockerfile on this repo.

Build image from Dockerfile:
`docker build -f firstimg.Dockerfile -t luisfelipe998/nginx-with-vim:latest .`

## Class 10: more on Dockerfile
WORKDIR command sets the folder the container will use for further commands and execution 

COPY commands copies a file/folder from machine to container

`docker build -f secondimg.Dockerfile -t luisfelipe998/nginx-with-vim:latest .`

By default, the container executes with root user. USER command may change this on Dockerfile.

## Class 11: ENTRYPOINT vs CMD
Entrypoint: The entrypoint defined on Dockerfile cannot be replaced by any command passed on `docker run <image-name> <command>`

Cmd: The command defined on Dockerfile can and will be replaced by the command passed on `docker run <image-name> <command>`. It may be used as parameter for the entrypoint if both defined

## Class 12: Entrypoint exec
ENV command sets environment variables: `ENV VAR_NAME VAR_VALUE` 

EXPOSE command exposes the container port to the outside world.

Check the [nginx image](https://github.com/nginxinc/docker-nginx/blob/5ce65c3efd395ee2d82d32670f233140e92dba99/mainline/debian/Dockerfile) out as an example.

`exec "$@"` on the entrypoint shell script executes the commands defined on CMD or dynamicly passed during docker run.

## Class 13: Publishing on Docker Hub
Push image to Dockerhub
`docker build -f thirdimg.Dockerfile -t luisfelipe998/nginx-custom .`
`docker push luisfelipe998/nginx-custom`

## Class 14: Networks
Enable one container to communicate with another.

Types:
- Bridge: one container communicates with another.
- Host: docker network with host network (local machine). Communicates the container with the host.
- Overlay: connect several dockers to communicate with others.
- Maclan: The container looks like a device connected on the host network.
- None: container runs isolated.

## Class 15: Bridge network
List networks:
`docker network ls`

Remove all unused networks:
`docker network prune`

Inspect network to see configured containers using it:
`docker network inspect <network-name>`

Another way to enter in container's terminal (attach):
`docker attach <container-name>`

When no network is provided to container, it automatically uses the default bridge network.

Create a new network:
`docker network create --driver bridge mynetwork`

Communicating 2 containers through the created network:
- `docker run -dit --name ubuntu1 --network mynetwork bash`
- `docker run -dit --name ubuntu2 --network mynetwork bash`
- `docker exec -it ubuntu1 bash`
- `ping ubuntu2` or `ping <ubuntu2-ip-addr>`

Connect a running container to a network:
`docker network connect <network-name> <container-name>`

## Class 16: Host network
Host network doesn't work on MacOS, because it will fetch the host network of the Linux VM and not the network from the host MacOS.

Using host network (should bind the container port to the host port automatically):
`docker run --rm -d --name nginx --network host nginx`

## Class 17: Accessing host machine
To access the local machine host on MacOS connected on a host network, instead of `localhost`, use `host.docker.internal`.

## Class 18: Installing a framework on a container
This example is stored on `laravel-example` folder. It uses the Laravel framework.

Run the container and check what needs to be installed to create a laravel custom image:
- `docker run -it --name php php:7.4.4-cli bash`
- `cd /var/www`
- `apt-get update`
- `apt-get install libzip-dev -y`
- `php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"`
- `php -r "if (hash_file('sha384', 'composer-setup.php') === '55ce33d7678c5a611085589f1f3ddf8b3c52d662cd01d4ba75c0ee0459970c2200a51f492d557530c71c15d8dba01eae') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"`
- `php composer-setup.php`
- `php -r "unlink('composer-setup.php');"`
- `docker-php-ext-install zip`
- `php composer.phar create-project --prefer-dist laravel/laravel laravel`

## Class 19: Creating image with framework
Create Dockerfile (check inside `laraval-example` folder).

Build image:
`docker build -t luisfelipe998/laravel:latest ./laravel-example`

Run built image:
`docker run -d --name laravel --rm -p 8000:8000 luisfelipe998/laravel`

See container logs:
`docker logs laravel`

Replacing CMD params by custom ones:
`docker run -d --name laravel --rm -p 8001:8001 luisfelipe998/laravel --host=0.0.0.0 --port=8001`

