function GUIInterface(simulator) {
  function enableForceDirected() {
    console.log("force-directed");
    simulator.velocityUniforms.layoutPositions.value =
      generateZeroedPositionTexture(nodesAndEdges, nodesWidth);
    temperature = 100;
  }

  function enableCircular() {
    console.log("circular");
    simulator.velocityUniforms.layoutPositions.value = generateCircularLayout(
      nodesAndEdges,
      nodesWidth
    );
    temperature = 1000;
  }

  function enableCircular2() {
    console.log("circular2");
    simulator.velocityUniforms.layoutPositions.value = generateCircularLayout2(
      nodesAndEdges,
      nodesWidth
    );
    temperature = 1000;
  }

  function enableSpherical() {
    console.log("spherical");
    simulator.velocityUniforms.layoutPositions.value = generateSphericalLayout(
      nodesAndEdges,
      nodesWidth
    );
    temperature = 1000;
  }

  function enableHelix() {
    console.log("helix");
    simulator.velocityUniforms.layoutPositions.value = generateHelixLayout(
      nodesAndEdges,
      nodesWidth
    );
    temperature = 1000;
  }

  function enableGrid() {
    console.log("grid");
    simulator.velocityUniforms.layoutPositions.value = generateGridLayout(
      nodesAndEdges,
      nodesWidth
    );
    temperature = 1000;
  }

  this.init = function () {
    var container = document.createElement("div");
    container.id = "layouts";

    var forceDirected = document.createElement("div");
    forceDirected.id = "forceDirected";
    $(forceDirected).append(
      "<img src='textures/forceDirected.png' style='display:none' height='32px' width='32px'>"
    );

    var circular = document.createElement("div");
    circular.id = "circular";
    $(circular).append(
      "<img src='textures/circle.png' style='display:none' height='32px' width='32px'>"
    );

    var circular2 = document.createElement("div");
    circular2.id = "circular2";
    $(circular2).append(
      "<img src='textures/circle.png' style='display:none' height='32px' width='32px'>"
    );

    var spherical = document.createElement("div");
    spherical.id = "spherical";
    $(spherical).append(
      "<img src='textures/sphere.png' style='display:none' height='32px' width='32px'>"
    );

    var helix = document.createElement("div");
    helix.id = "helix";
    $(helix).append(
      "<img src='textures/spring.png' style='display:none' height='32px' width='32px'>"
    );

    var grid = document.createElement("div");
    grid.id = "grid";
    $(grid).append(
      "<img src='textures/square.png' style='display:none' height='32px' width='32px'>"
    );

    container.appendChild(forceDirected);
    container.appendChild(document.createElement("br"));
    container.appendChild(circular);
    container.appendChild(document.createElement("br"));
    container.appendChild(circular2);
    container.appendChild(document.createElement("br"));
    container.appendChild(spherical);
    container.appendChild(document.createElement("br"));
    container.appendChild(helix);
    container.appendChild(document.createElement("br"));
    container.appendChild(grid);
    document.body.appendChild(container);

    $("#forceDirected").on("click", enableForceDirected);
    $("#circular").on("click", enableCircular);
    $("#circular2").on("click", enableCircular2);
    $("#spherical").on("click", enableSpherical);
    $("#helix").on("click", enableHelix);
    $("#grid").on("click", enableGrid);
  };
}
