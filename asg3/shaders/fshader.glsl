#ifdef GL_ES
precision mediump float;
#endif

// Color
varying vec4 v_Color;

// Texture
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

// Lighting
uniform float u_SpecularN;
uniform int u_RenderNormals;
uniform int u_UseLighting;
uniform vec3 u_AmbientLight;
uniform vec3 u_DiffuseColor;
uniform vec3 u_SpecularColor;
uniform vec3 u_LightPosition;
uniform vec3 u_ViewPosition;
varying vec3 v_Position;
varying vec3 v_Normal;

void main() {
    vec3 normal = normalize(v_Normal); // Normalize normal because it's interpolated and not 1.0 (length)

    if (u_RenderNormals == 1) {
        gl_FragColor = vec4(normal*0.5+0.5, 1.0);
    } else {
        // Texture / coloring
        vec4 texel = v_Color + texture2D(u_Sampler, v_TexCoord);

        if (u_UseLighting == 1) {


            // Lighting
            vec3 lightDirection = normalize(u_LightPosition - v_Position); // Light direction w/ length=1

            // Diffuse lighting
            float nDotL = max(dot(normalize(lightDirection), normal), 0.0); // Resulting vector between the light direction and the normal vector
            vec3 diffuse = u_DiffuseColor * nDotL; // Calculate the color due to the refexion

            // Specular lighting
            vec3 specular = vec3(0, 0, 0);

            // The specular function is actually going to be the same for front and back faces because GLSL
            // reflect is insensitive to the sign of the normal. So we need to check it first, and we can do
            // that by checking nDotL. -> reflect(I, N) = I - 2.0 * dot(N, I) * N
            // So it prevents specular ligthing from showing on the back faces
            if (nDotL > 0.0) {
                float n = 10.0;
                vec3 V = normalize(u_ViewPosition - v_Position);
                vec3 R = reflect(- lightDirection, normal);
                specular = u_SpecularColor * pow(clamp(dot(V, R), 0.0, 1.0), u_SpecularN);
            }

            vec3 lighting = u_AmbientLight + diffuse + specular;

            // Result
            gl_FragColor = vec4(texel.rgb * lighting, texel.a);
        } else {
            gl_FragColor = texel;
        }
    }
}