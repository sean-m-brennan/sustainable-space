import {CameraHelper, FogExp2, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import {OrbitControls} from "@react-three/drei";
import {getBrowserLocation} from "@/client/location";
import {angle_between_vectors, rotate_vector, X_AXIS, Y_AXIS, Z_AXIS} from "./util/coordinates.ts";
import {distance} from "./util/hypertext.ts";
import {Orbital} from "./planet/planet.tsx";
import {Orrery} from "./space_context";
import {EffectComposer, RenderPass} from "three-stdlib";

const ENABLE_ORBIT_CONTROLS = true;
const ENABLE_VIEW_OFFSET = false;
const VISUAL_DEBUG = true;


export class Cameras {
    system: Orrery;
    screen_height: number;
    screen_width: number;
    lat_lon_alt: [number, number, number];

    lenses = [6, 12, 16, 24, 35, 50, 60, 85, 105, 200, 400, 800];
    max_view = this.lenses.length - 1;
    min_view = 0;
    initial_view = 4;
    view = this.initial_view;
    camera_dist = 30000;
    zoom;
    cameras = [];
    camera_idx = 0;
    camera_delta = 0;
    camera_scale = 100;
    active_camera;

    orbitals: Orbital[];
    sun_earth_cam;

    shift_key = false;
    controls;
    scene;
    renderer;
    effects_composer;
    composer;
    effects_scene;
    special_effects = new SpecialEffects();


    cycleCamera() {
        this.camera_idx++;
        if (this.camera_idx >= this.cameras.length)
            this.camera_idx = 0;
        this.active_camera = this.cameras[this.camera_idx];
        this.camera_delta = 0;
        this.active_camera.updateProjectionMatrix();
        if (this.camera_idx === 0)
            console.debug("Earth cam");
        else if (this.camera_idx === 1)
            console.debug("Sun cam");
        else if (this.camera_idx === 2)
            console.debug("Rotating cam");
        else
            console.debug("Camera error");
    };

    cameraFollow(num: number) {
        let followed = false;
        if (typeof num !== 'undefined' && num !== null) {
            let sat = this.orbitals[num];
            if (sat !== null) {
                this.active_camera = sat.camera;
                this.camera_delta = 0;
                followed = true;
            }
        }
        if (!followed) {  /* follow Earth */
            this.active_camera = this.cameras[this.camera_idx];
            this.camera_delta = 0;
            this.view = this.initial_view;
            this.zoom = this.computeZoom();
        }
        this.active_camera.updateProjectionMatrix();
    };

    computeZoom(): number {
        return this.lenses[this.view];
    };

    onZoom(delta: number) {
        if (delta < 0)
            this.view--;
        else if (delta > 0)
            this.view++;
        if (this.view < this.min_view)
            this.view = this.min_view;
        else if (this.view > this.max_view)
            this.view = this.max_view;
        this.zoom = this.computeZoom();
    };

    rotateCamera(axis: Vector3) {
        let dist = distance(this.active_camera.position,
            this.active_camera.target.position);
        //let major_axis, minor_axis;

        let theta = angle_between_vectors(this.active_camera.position,
            this.active_camera.target.position);
        let major_axis = rotate_vector(this.active_camera.position, theta,
            this.active_camera.target.position).normalize();
        let phi = angle_between_vectors(major_axis, X_AXIS);
        let minor_axis = rotate_vector(X_AXIS.clone(), phi, X_AXIS);
        // FIXME not working properly
        if (axis === Y_AXIS) {
            major_axis = X_AXIS;
            minor_axis = Z_AXIS;
        } else {
            major_axis = Y_AXIS;
            minor_axis = Z_AXIS;
        }
        this.active_camera.position.set(
            this.active_camera.target.position.x +
            dist * Math.cos(this.camera_delta) * major_axis.x +
            dist * Math.sin(this.camera_delta) * minor_axis.x,
            this.active_camera.target.position.y +
            dist * Math.cos(this.camera_delta) * major_axis.y +
            dist * Math.sin(this.camera_delta) * minor_axis.y,
            this.active_camera.target.position.z +
            dist * Math.cos(this.camera_delta) * major_axis.z +
            dist * Math.sin(this.camera_delta) * minor_axis.z
        );
        this.active_camera.lookAt(new Vector3(0, 0, 0));
    };

    onKeyUp(code: number): boolean {
        console.debug("Key up " + code.toString());
        if (code == 16) {  /* shift */
            this.shift_key = false;
            return true;
        }
    };

    onKeyDown(code: number) {
        console.debug("Key down " + code.toString());
        if (code == 16) {  /* shift */
            this.shift_key = true;
            return true;
        } else if (code == 73) {  /* 'i' */
            if (this.system.earth.density_map)  // FIXME assign as callback
                this.system.earth.disableDensity();
            else
                this.system.earth.setDensityAltitude(1000.0);
            return true;
        } else if (code == 79) {  /* 'o' */
            if (this.system.earth.radiation_belt)
                this.system.earth.disableRadiationBelt();
            else
                this.system.earth.enableRadiationBelt();
            return true;
        } else if (code == 67) {  /* 'c' */
            this.cycleCamera();
            return true;
        } else if (code == 90) {  /* 'z' */
            if (this.shift_key)
                this.active_camera.translateZ(100);
            else
                this.active_camera.translateZ(-100);
            return true;
        } else if (code == 87) {  /* 'w' */
            this.camera_delta += 2 * Math.PI / this.camera_scale;
            if (this.camera_delta >= (2 * Math.PI))
                this.camera_delta -= 2 * Math.PI;
            this.rotateCamera(Z_AXIS);
            return true;
        } else if (code == 83) {  /* 's' */
            this.camera_delta += 2 * Math.PI * -1.0 / this.camera_scale;
            if (this.camera_delta <= (2 * Math.PI))
                this.camera_delta += 2 * Math.PI;
            this.rotateCamera(Z_AXIS);
            return true;
        } else if (code == 65) {  /* 'a' */
            this.camera_delta += 2 * Math.PI * -1.0 / this.camera_scale;
            if (this.camera_delta <= (2 * Math.PI))
                this.camera_delta += 2 * Math.PI;
            this.rotateCamera(Y_AXIS);
            return true;
        } else if (code == 68) {  /* 'd' */ // FIXME initial rotateCamera ?
            this.camera_delta += 2 * Math.PI / this.camera_scale;
            if (this.camera_delta >= (2 * Math.PI))
                this.camera_delta -= 2 * Math.PI;
            this.rotateCamera(Y_AXIS);
            return true;
        } else if (code == 38) {  /* up */
            this.system.increaseTimestep();  // FIXME callback
            return true;
        } else if (code == 40) {  /* dn */
            this.system.decreaseTimestep();
            return true;
        }
        return false;
    };


    constructor(orrery: Orrery, container, width: number, height: number) {
        this.system = orrery
        this.screen_width = width;
        this.screen_height = height;
        this.lat_lon_alt = getBrowserLocation();

        this.scene = new Scene();
        this.scene.fog = new FogExp2(0x000000, 0.00000025);

        let earth_cam = new PerspectiveCamera(
            25, (this.screen_width / this.screen_height), 50, 1e7);
        earth_cam.position.z = this.camera_dist;
        earth_cam.useTarget = true;
        let target1 = new Object3D();
        let edge = 0;
        if (ENABLE_VIEW_OFFSET)
            edge = 2 * (this.system.earth.radius + this.system.earth.atmosphere_height) / 3;
        target1.position.set(edge, edge, 0);
        target1.add(earth_cam);
        earth_cam.target = target1;
        earth_cam.lookAt(new Vector3(0, 0, 0));
        let idx = this.cameras.length
        this.cameras.push(earth_cam);
        this.cameraFollow(idx);
        this.scene.add(target1);
        this.active_camera = earth_cam;

        this.sun_earth_cam = new PerspectiveCamera(
            25, (this.screen_width / this.screen_height), 50, 1e7);
        this.sun_earth_cam.useTarget = true;
        let target2 = new Object3D();
        target2.position.set(0, 0, 0);
        target2.add(this.sun_earth_cam);
        this.sun_earth_cam.target = target2;
        let sun_vec = this.system.sun.direction.clone().normalize();
        let pos = sun_vec.multiplyScalar(this.camera_dist);
        this.sun_earth_cam.position.set(pos.x, pos.y, pos.z);
        this.sun_earth_cam.lookAt(new Vector3(0, 0, 0));
        this.cameras.push(this.sun_earth_cam);
        this.scene.add(target2);

        let lock_cam = new PerspectiveCamera(
            25, (this.screen_width / this.screen_height), 50, 1e7);
        lock_cam.useTarget = true;
        this.system.earth.objects[0].add(lock_cam);
        lock_cam.target = this.system.earth.objects[0];

        /*
        let j2k = this.coord_system.fixedToJ2000(this.start,
            this.lat_lon_alt[0], this.lat_lon_alt[1], this.lat_lon_alt[2] + 10000.0);
        this.lock_cam.position.set(j2k.x, j2k.y, j2k.z);
        */
        // FIXME implement J2K conversion instead
        let to_rad = Math.PI / 180.0;
        let eci = this.system.coord_system.geodeticToEci(this, this.system.earth,
            this.lat_lon_alt[0] * to_rad, this.lat_lon_alt[1] * to_rad,
            this.lat_lon_alt[2] + 10000.0 - this.system.earth.radius, 1000.0);
        lock_cam.position.set(eci.x, eci.y, eci.z);
        lock_cam.lookAt(new Vector3(0, 0, 0));
        this.cameras.push(lock_cam);

        let camera_helper1 = new CameraHelper(earth_cam);
        this.scene.add(camera_helper1);
        let camera_helper2 = new CameraHelper(this.sun_earth_cam);
        this.scene.add(camera_helper2);
        let camera_helper3 = new CameraHelper(lock_cam);
        this.scene.add(camera_helper3);

        if (!VISUAL_DEBUG) {
            camera_helper1.visible = false;
            camera_helper2.visible = false;
            camera_helper3.visible = false;
        }

        if (ENABLE_ORBIT_CONTROLS)
            this.controls = OrbitControls(earth_cam);  // FIXME

        let objects = this.system.stars.objects.concat(
            this.system.sun.objects, this.system.earth.objects, this.system.moon.objects);
        for (let i = 0; i < objects.length; i++)
            this.scene.add(objects[i]);

        this.renderer = new WebGLRenderer({antialias: true});
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.setSize(this.screen_width, this.screen_height);
        this.renderer.sortObjects = false;
        this.renderer.autoclear = false;
        this.renderer.antialias = true;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowCameraNear = 3;
        this.renderer.shadowCameraFar = this.active_camera.far;
        this.renderer.shadowCameraFov = 50;
        this.renderer.shadowMapBias = 0.0039;
        this.renderer.shadowMapDarkness = 0.5;
        this.renderer.shadowMapWidth = 1024;
        this.renderer.shadowMapHeight = 1024;

        container.appendChild(this.renderer.domElement);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene,
            this.active_camera));
        /* TODO
        this.special_effects.init(this.composer, this.renderer, this.active_camera,
                       this.earth.effects_objects,
                       this.screen_width, this.screen_height);
            */

        window.addEventListener('resize', onWindowResize, false);
    }

    render() {
        if (!this.system.paused) {
            if (ENABLE_ORBIT_CONTROLS)
                this.controls.update();
        }
        let sun_vec = this.system.sun.dirLight.position.clone().normalize();
        let pos = sun_vec.multiplyScalar(this.camera_dist);
        this.sun_earth_cam.position.set(pos.x, pos.y, pos.z);
        this.sun_earth_cam.lookAt(new Vector3(0, 0, 0));

        this.active_camera.setLens(this.zoom);
        this.active_camera.updateProjectionMatrix();

        //this.renderer.clear();
        this.renderer.render(this.scene, this.active_camera);

        /* TODO pluggable effects (see postprocessing examples)
        this.special_effects.render();
        this.composer.render(0.1);
            */
    }
}