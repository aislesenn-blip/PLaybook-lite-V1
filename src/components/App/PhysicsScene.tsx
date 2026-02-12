import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

interface PhysicsSceneProps {
  dayId: number; // 8 or 9
}

const PhysicsScene: React.FC<PhysicsSceneProps> = ({ dayId }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Module aliases
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint,
          Events = Matter.Events;

    // Create engine
    const engine = Engine.create();
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
        pixelRatio: window.devicePixelRatio
      }
    });
    renderRef.current = render;

    // Create boundaries
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 30, window.innerWidth, 60, { isStatic: true, render: { fillStyle: 'transparent' } });
    const leftWall = Bodies.rectangle(-30, window.innerHeight / 2, 60, window.innerHeight, { isStatic: true, render: { fillStyle: 'transparent' } });
    const rightWall = Bodies.rectangle(window.innerWidth + 30, window.innerHeight / 2, 60, window.innerHeight, { isStatic: true, render: { fillStyle: 'transparent' } });

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Add custom rendering for numbers
    Events.on(render, 'afterRender', () => {
      const context = render.context;
      const bodies = Composite.allBodies(engine.world);

      context.font = "bold 40px Inter";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#FFFFFF";

      bodies.forEach(body => {
        if (!body.isStatic && body.label !== 'Mouse Body') {
           const { x, y } = body.position;
           const angle = body.angle;

           context.save();
           context.translate(x, y);
           context.rotate(angle);
           context.fillText(body.label, 0, 0);
           context.restore();
        }
      });
    });

    // Start runner
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    Render.run(render);

    // Initial Drop
    const interval = setInterval(() => {
      spawnObject();
    }, 1000);

    const spawnObject = () => {
      const x = Math.random() * (window.innerWidth - 100) + 50;
      const label = dayId === 8 ? "1" : dayId === 9 ? "2" : "?";
      const color = dayId === 8 ? "#F59E0B" : "#10B981"; // Amber or Emerald

      const body = Bodies.circle(x, -50, 40, {
        restitution: 0.9, // Bouncy
        friction: 0.005,
        label: label,
        render: {
          fillStyle: color,
          strokeStyle: '#ffffff',
          lineWidth: 4
        }
      });
      Composite.add(engine.world, body);
    };

    return () => {
      clearInterval(interval);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      if (render.canvas) {
          render.canvas.remove();
      }
    };
  }, [dayId]);

  return (
    <div
      ref={sceneRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-auto"
    />
  );
};

export default PhysicsScene;
