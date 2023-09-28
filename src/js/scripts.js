import * as THREE from 'three'
import * as YUKA from 'yuka'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

const TOTAL_FISH = 50

const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const ambientLight = new THREE.AmbientLight('white', 1)
scene.add(ambientLight)

const directionalLight = new THREE.AmbientLight('white', 1)
scene.add(directionalLight)

renderer.setClearColor(0xa3a3a3)

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.set(0, 20, 0)
camera.lookAt(scene.position)

const entityManager = new YUKA.EntityManager()

// const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8)
// vehicleGeometry.rotateX(Math.PI * 0.5)
// const vehicleMaterial = new THREE.MeshNormalMaterial()

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix)
}

let mixer = null

const loader = new GLTFLoader()
loader.load('./assets/clown_fish.glb', (glb) => {
  const model = glb.scene
  const clips = glb.animations
  const fishes = new THREE.AnimationObjectGroup()
  mixer = new THREE.AnimationMixer(fishes)
  const clip = THREE.AnimationClip.findByName(clips, 'Swim')
  const action = mixer.clipAction(clip)
  action.play()

  for (let i = 0; i < TOTAL_FISH; i++) {
    const fishClone = SkeletonUtils.clone(model)
    // const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial)
    fishClone.matrixAutoUpdate = false
    scene.add(fishClone)
    fishes.add(fishClone)

    const vehicle = new YUKA.Vehicle()
    vehicle.scale.multiplyScalar(0.25)
    vehicle.setRenderComponent(fishClone, sync)

    const wanderBehavior = new YUKA.WanderBehavior()
    vehicle.steering.add(wanderBehavior)

    entityManager.add(vehicle)

    vehicle.position.x = 2.5 - Math.random() * 5
    vehicle.position.z = 2.5 - Math.random() * 5
    vehicle.rotation.fromEuler(0, 2 * Math.PI * Math.random(), 0)
  }
})

const time = new YUKA.Time()
const clock = new THREE.Clock()

function animate() {
  const clockDelta = clock.getDelta()
  const delta = time.update().getDelta()
  entityManager.update(delta)

  if (mixer) mixer.update(clockDelta)

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
